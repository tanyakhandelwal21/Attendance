let polls = [
    {
        name: "Lecture1",
        date: "November 20, 2018",
        id: "123"
    },{
        name: "Lecture2",
        date: "November 28, 2018",
        id: "432"
    }
];

let container = document.getElementById('container');

function displayItems(polls) {
    console.log(polls);
    polls.forEach(poll => displayItem(poll));
}

function displayItem(poll) {
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    let cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    let cardTitle = document.createElement('span');
    cardTitle.classList.add('card-title');
    cardTitle.innerHTML = poll.name;
    let cardDesc = document.createElement('p');
    cardDesc.innerHTML = poll.date;
    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardDesc);
    cardDiv.appendChild(cardContent);
    cardDiv.onclick = () => {
        window.location.href=`single-poll.html`;
    }
    container.appendChild(cardDiv);
}
displayItems(polls);
