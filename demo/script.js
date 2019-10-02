class Demo {
  constructor() {
    this.form = document.querySelector('#form')
    this.dateInput = document.querySelector('#date')
    this.timeInput = document.querySelector('#time')
    this.latitudeInput = document.querySelector('#latitude')
    this.longitudeInput = document.querySelector('#longitude')


    this.handleSubmit = this.handleSubmit.bind(this)

    this.form.addEventListener('submit', this.handleSubmit)
  }

  handleSubmit(e) {
    e.preventDefault()
    const date = this.dateInput.value.split('-')
    const time = this.timeInput.value.split(':')
    const origin = {
      year: parseInt(date[0]),
      month: parseInt(date[1]),
      day: parseInt(date[2]),
      hours: parseInt(time[0]),
      minutes: parseInt(time[1]),
      seconds: 0,
      latitude: parseFloat(this.latitudeInput.value),
      longitude: parseFloat(this.longitudeInput.value)
    }

  const ephemeris = new Moshier.Ephemeris(origin)
  console.log(`EPHEMERIS RESULTS FOR ${this.dateInput.value} -- ${this.timeInput.value} UTC}`, ephemeris.Results)

  ephemeris.Results.forEach(result => {
    const ddEl = document.querySelector(`#${result.key}-dd`)
    if (ddEl) ddEl.innerHTML = result.position.apparentLongitude.toFixed(4)

    const dmsEl = document.querySelector(`#${result.key}-dms`)
    if (dmsEl) dmsEl.innerHTML = result.position.apparentLongitudeString
  })

  }
}
