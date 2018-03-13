//Nuova Comunicazione
document.getElementById('notice').onsubmit = function (e) {
    e.preventDefault();
    var data = {
        date: document.getElementsByName('date')[0].value,
        title: document.getElementsByName('title')[0].value,
        category: document.getElementsByName('category')[0].value,
        content: document.getElementsByName('content')[0].value,
        sender: document.getElementsByName('sender')[0].value,
        recipient_id_number: document.getElementsByName('recipient_id_number')[0].value,
        broadcast: document.getElementsByName('broadcast')[0].value
    };

    fetch('/api/segreteria/notice/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(function (response) {
        if (response.ok) {
            document.getElementById('notice-response').innerHTML = "Comunicazione inviata con successo!";
            close();
        } else {
            document.getElementById('notice-response').innerHTML = "Si è verificato un'errore nell'invio della comunicazione.";
        }
        //return response.json();
    });
}

//Nuovo Appello
document.getElementById('examsession').onsubmit = function (e) {
    e.preventDefault();
    var data = {
        name: document.getElementsByName('name')[0].value,
        exam_id: document.getElementsByName('exam_id')[0].value,
        session_date: document.getElementsByName('session_date')[0].value,
        publication_date: document.getElementsByName('publication_date')[0].value,
        expiration_date: document.getElementsByName('expiration_date')[0].value,
        exam_name: document.getElementsByName('exam_id')[0].options[document.getElementsByName('exam_id')[0].selectedIndex].text
    };
    fetch('/api/exam_sessions/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    fetch('/api/segreteria/examsession/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(function (response) {
        if (response.ok) {
            document.getElementById('examsession-response').innerHTML = "Appello aggiunto con successo!";
            close();
        } else {
            document.getElementById('examsession-response').innerHTML = "Si è verificato un'errore nell'aggiunta dell'appello.";
        }
        //return response.json();
    });
}

//Nuovo esito
document.getElementById('examgraderesult').onsubmit = function (e) {
    e.preventDefault();
    var data = {
        id_number: document.getElementsByName('id_number')[0].value,
        exam_id: document.getElementsByName('exam_id2')[0].value,
        grade: document.getElementsByName('grade')[0].value,
        exam_name: document.getElementsByName('exam_id')[0].options[document.getElementsByName('exam_id2')[0].selectedIndex].text
    };
    fetch('/api/students/'+document.getElementsByName('id_number')[0].value+'/exam_grade/'+document.getElementsByName('exam_id2')[0].value+'/', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    fetch('/api/segreteria/examgraderesult/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(function (response) {
        if (response.ok) {
            document.getElementById('examsession-response').innerHTML = "Esito aggiunto con successo!";
            close();
        } else {
            document.getElementById('examsession-response').innerHTML = "Si è verificato un'errore nell'aggiunta dell'esito.";
        }
        //return response.json();
    });
}


//Adding exam list in select
fetch('/api/exams/', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(body => body.forEach(function (element) {
    var option = '<option value="'+element._id+'" asd="'+element.name+'">'+element.name+'</option>'
    document.getElementById('examlist1').insertAdjacentHTML('afterbegin',option)
    document.getElementById('examlist2').insertAdjacentHTML('afterbegin',option)
}))
