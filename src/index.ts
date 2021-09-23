interface content {
  emailBody?: any
}

function start() {
  const content: content = {}

  content.emailBody = getEmailBody()

  function getEmailBody () {
    console.log("Pegando o body do email")
  }
}

start()