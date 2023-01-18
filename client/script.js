import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat-container");

let loadInterval;

//function that adds three dots while the bot typing

function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';
  
  if (element.textContent === '....') {
    element.textContent = '';
  }
}, 300)
}

//function that types out the bot's response

function typeText(element, text) {
  let i = 0;
  let interval = setInterval(() => {
    if(i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(interval);
    }
}, 20);
}

//function that generates a unique ID for each chat stripe

function generateUniqueID() {
  const timestamp = Date.now();
  const randomNum = Math.random();
  const hexadecimalString = randomNum.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//function that creates the chat stripe and returns it as a html element

function chatStripe(isAI, value, uniqueID){
  return (

  `
  <div class="wrapper ${isAI && "ai"}">
    <div class="chat">
      <div class="profile">
        <img src="${isAI ?  bot :  user}"
             alt="${isAI ? 'bot' : 'bot'}" />
     </div>

  <div class="message" id=${uniqueID}>${value}</div>
    </div>
  </div>
  `
  )
}

//function that handles the submit event

const handleSubmit = async(e) => {
  e.preventDefault();
  const data = new FormData(form);

  //User chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //Bot Chatstripe 
  const uniqueID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueID);
  
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);

  loader(messageDiv);

  // Fetch data from server

const response = await fetch("https://chatgpt-app-rmbr.onrender.com", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ prompt: data.get("prompt") })
});

clearInterval(loadInterval);
messageDiv.innerHTML = "";

if(response.ok) {
  const data = await response.json();
  const parsedData = data.bot.trim();

  typeText(messageDiv, parsedData);
} else {
  const err = await response.text();

  messageDiv.innerHTML = "error";
  alert(err);
}

}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (event.key === 'Enter' ) {
    handleSubmit(e);
  }
});
