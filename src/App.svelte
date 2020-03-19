<script>
  // ==================
  // HELPER FUNCTIONS
  // ==================

  function generateArray (length) {
    return Array.from(Array(length).keys())
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  }

  function shuffleArray (a) {
    let j, x, i

    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      x = a[i]
      a[i] = a[j]
      a[j] = x
    }

    return a
  }

  function getStatusClass (l) {
    let c = l.mobility === 0 ? 'isolated ' : ''
    if (l.recovered) return c + 'recovered'
    if (l.infected) return c + 'infected'
    return c || null
  }

  // ==================
  // GLOBAL VARIABLES
  // ==================

  let lockdown = 0 // min 0, max 50
  let samples = 100
  let initialCases = 1 // min 1, max 20
  let avgMobility = 7 // min 1, max 10
  let infectDiscovery = 1
  let selfIsolationAware = 1 // min 1, max 10
  let medicalCapacity = 20 // min 1, max 100
  let recoverySpeed = 20 // min 1, max 8
  let chanceDeath = 1

  let points = []
  let infectedIndexes = []
  let normalIndexes = []

  let totalNormal = 0
  let totalInfected = 0
  let totalRecovered = 0
  let totalDeath = 0

  let timers = { tick: null, timeouts: [] }

  // =========
  // ACTIONS
  // =========

  function run () {
    // clear previous running simulation state if exist

    if (timers.tick) {
      clearInterval(timers.tick)
    }

    for (var i = timers.timeouts.length - 1; i >= 0; i--) {
      clearTimeout(timers.timeouts[i])
    }

    infectedIndexes = []
    normalIndexes = []
    totalRecovered = 0

    // generate samples with random characteristics

    const minMobility = avgMobility > 3 ? avgMobility - 3 : 1
    const maxMobility = avgMobility + 3

    points = generateArray(samples).map(l => ({
      x: getRandomInt(110, 490),
      y: getRandomInt(110, 400),
      mobility: getRandomInt(minMobility, maxMobility),
      infected: false,
      recovered: false,
      recovering: false,
      isolating: false,
      aware: getRandomInt(1, 10) < selfIsolationAware
    }))

    // add people who decides to lockdown

    for (let i = lockdown - 1; i >= 0; i--) {
      points[i].mobility = 0
    }

    // shuffle array of samples before choosing who is infected

    points = shuffleArray(points)

    // choose person who infected and who is not

    for (let i = initialCases - 1; i >= 0; i--) {
      points[i].infected = true
      infectedIndexes.push(i)
    }

    normalIndexes = generateArray(samples).slice(initialCases)

    // set simulation

    timers.tick = setInterval(() => {
      // iterate over all samples

      points = points.map(l => {
        // each points random movements
        l.x = l.x - l.mobility + getRandomInt(1, 2 * l.mobility)
        l.y = l.y - l.mobility + getRandomInt(1, 2 * l.mobility)

        // simulate infection spread

        if (l.infected && !l.recovered) {
          const infecting = []

          // add recovery time on infected person

          if (!l.recovering) {
            points[points.indexOf(l)].recovering = true

            function recovering () {
              timers.timeouts.slice(timers.timeouts.indexOf(id))
              points[points.indexOf(l)].recovered = true
              totalRecovered += 1
            }

            const dayMin = recoverySpeed > 3 ? recoverySpeed - 3 : 1
            const dayMax = recoverySpeed + 3
            const recoveringTime = getRandomInt(dayMin, dayMax) * 2000

            let id = setTimeout(recovering, recoveringTime)
            timers.timeouts.push(id)
          }

          // add time to self isolate on infected person

          if (l.aware && !l.isolating) {
            points[points.indexOf(l)].isolating = true

            function selfIsolate () {
              timers.timeouts.slice(timers.timeouts.indexOf(id))
              points[points.indexOf(l)].mobility = 0
            }

            const dayMin = infectDiscovery > 3 ? infectDiscovery - 3 : 1
            const dayMax = infectDiscovery + 3
            const selfIsolateTime = getRandomInt(dayMin, dayMax) * 1000

            let id = setTimeout(selfIsolate, selfIsolateTime)
            timers.timeouts.push(id)
          }

          // choosing people infected by this person

          for (let i = normalIndexes.length - 1; i >= 0; i--) {
            const target = points[normalIndexes[i]]
            const touchedX = Math.abs(target.x - l.x) < 10
            const touchedY = Math.abs(target.y - l.y) < 10
            if (touchedX && touchedY) infecting.push(normalIndexes[i])
          }

          // do the infection

          for (var i = infecting.length - 1; i >= 0; i--) {
            points[infecting[i]].infected = true
            infectedIndexes.push(infecting[i])
            normalIndexes.splice(normalIndexes.indexOf(infecting[i]), 1)
          }
        }

        return l
      })

      // update number of normal and infected people

      totalNormal = normalIndexes.length
      totalInfected = infectedIndexes.length
    }, 100)
  }
</script>

<main>
  <div class="grid grid-cols-4 gap-4 p-4">
    <div class="col-span-4 md:col-span-1">
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Samples ({samples} person)
        </label>
        <input
          type="range"
          max="200"
          min="100"
          bind:value={samples}
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Locking Down ({lockdown} person)
        </label>
        <input
          type="range"
          max="100"
          min="0"
          bind:value={lockdown}
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Initial Cases ({initialCases} person)
        </label>
        <input
          type="range"
          max="20"
          min="1"
          bind:value={initialCases}
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Urban Mobility ({avgMobility * 100} meter)
        </label>
        <input
          type="range"
          max="10"
          min="1"
          bind:value={avgMobility}
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Infection Discoverability ({infectDiscovery} days)
        </label>
        <input
          type="range"
          max="10"
          min="1"
          bind:value={infectDiscovery}
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Self Isolation Awareness ({selfIsolationAware} / 10)
        </label>
        <input
          type="range"
          max="10"
          min="1"
          bind:value={selfIsolationAware}
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Medical Infrastructure Capacity ({medicalCapacity} patient)
        </label>
        <input
          type="range"
          max="100"
          min="1"
          bind:value={medicalCapacity}
          disabled
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Speed of Recovery ({recoverySpeed * 2} days)
        </label>
        <input
          type="range"
          max="20"
          min="1"
          bind:value={recoverySpeed}
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <label class="block tracking-wide text-sm font-bold mb-2">
          Chance of Death ({chanceDeath} / 100)
        </label>
        <input
          type="range"
          max="10"
          min="1"
          bind:value={chanceDeath}
          disabled
          class="w-full"
        />
      </div>
      <div class="w-full mb-2">
        <button
          on:click={run}
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start
        </button>
      </div>
    </div>
    <div class="col-span-4 md:col-span-2">
      <svg
        height="480"
        width="640"
        style="border: 1px solid #000;"
      >
        {#each points as point}
          <circle
            cx='{point.x}'
            cy='{point.y}'
            r='5'
            class="{getStatusClass(point)}"
          />
        {/each}
      </svg>
    </div>
    <div class="col-span-4 md:col-span-1">
      <table class="table">
        <tr>
          <td>Normal</td>
          <td>{totalNormal}</td>
          <td>{(totalNormal * 100 / samples).toFixed(2)}% samples</td>
        </tr>
        <tr>
          <td>Infected</td>
          <td>{totalInfected - totalRecovered}</td>
          <td>{((totalInfected - totalRecovered) * 100 / samples).toFixed(2)}% samples</td>
        </tr>
        <tr>
          <td>Recovered</td>
          <td>{totalRecovered}</td>
          <td>{(totalRecovered * 100 / totalInfected).toFixed(2)}% cases</td>
        </tr>
      </table>
    </div>
  </div>
</main>

<style>
  circle {
    fill: green;
  }
  circle.infected {
    fill: orange;
  }
  circle.recovered {
    fill: blue;
  }
  circle.isolated {
    stroke: black;
  }

  .table {
    border: 1px solid black;
    width: 100%;
  }
  .table td {
    border: 1px solid black;
    padding: 4px 8px;
  }
</style>
