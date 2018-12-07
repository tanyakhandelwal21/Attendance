let poll = {
  question: "This is a cool project",
  choices: [
    {
        value: "true"
    },{
        value: "false"
    }
  ],
  correctAnswer: "true",
  id: "123"
};

let container = document.getElementById('container');

function displayItems(poll) {
    console.log(poll);
    let questionHeader = document.createElement('h2');
    questionHeader.classList.add('center-align');

    questionHeader.innerHTML = poll.question;
    container.appendChild(questionHeader)
    poll.choices.forEach(choice => displayItem(choice));
}

function displayItem(choice) {
   
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    let cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    let cardTitle = document.createElement('span');
    cardTitle.classList.add('card-title');
    cardTitle.innerHTML = choice.value;
    //let cardDesc = document.createElement('p');
    //cardDesc.innerHTML = poll.date;
    cardContent.appendChild(cardTitle);
    //cardContent.appendChild(cardDesc);
    cardDiv.appendChild(cardContent);
    cardDiv.onclick = () => {
        alert("Your answer has been recorded!");
        //window.location.href=`/course-detail/${poll.id}`;
    }
    container.appendChild(cardDiv);
}
displayItems(poll);
