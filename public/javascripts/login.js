document.getElementById('login-form').onsubmit = function (e) {
    e.preventDefault();
    var data = {
        id_number: document.getElementsByName('id_number')[0].value,
        password: document.getElementsByName('password')[0].value
    };

    fetch('/api/login/' + location.href.split('/login/')[1],
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(function (response) {
            if (response.ok) {
                document.getElementById('login-form').style.display = "none";
                document.getElementById('title').innerHTML = "Accesso effettuato. <br>Torna a Telegram per iniziare ad utilizzare UniudBot.";
                close();
            } else {
                document.getElementById('title').innerHTML = "Accesso negato. <br>Matricola e/o password errati.";
            }
            return response.json();
        });
}
