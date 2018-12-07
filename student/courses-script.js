let courses = [
    {
        name: "cs252",
        id: "123"
    },{
        name: "cs180",
        id: "432"
    }
];

let container = document.getElementById('container');

function displayItems(courses) {
    console.log(courses);
    courses.forEach(course => displayItem(course));
}

function displayItem(course) {
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    let cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    let cardTitle = document.createElement('span');
    cardTitle.classList.add('card-title');
    cardTitle.innerHTML = course.name;
    // let cardDesc = document.createElement('p');
    // cardDesc.innerHTML = item.description;
    cardContent.appendChild(cardTitle);
    // cardContent.appendChild(cardDesc);
    cardDiv.appendChild(cardContent);
    cardDiv.onclick = () => {
        window.location.href=`polls.html`;
    }
    container.appendChild(cardDiv);
}
displayItems(courses);
