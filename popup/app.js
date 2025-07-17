const books = [];
let searchValue;
//Bookmark
async function getTitle(){
  let [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  return tab.title;
}


function addBookToLibrary(newBook){
  chrome.storage.local.get(["books"], (result) =>{
    const books = result.books || [];
    const existingIndex = books.findIndex(book => book.Title === newBook.Title);
    if(existingIndex !== -1){
      books.splice(existingIndex,1);
      books.unshift(newBook);
    }else{
      books.unshift(newBook);
    }
    chrome.storage.local.set({books}, () => {
      console.log("book saved");
    });
  });
}

function displayRecentlyBookmarked(){
  chrome.storage.local.get(["books"], (result) => {
    for(let i = 0; i < 5; i++){
      document.getElementById(`bookTitle${i}`).textContent = result.books[i].Title ?? "";
      document.getElementById(`bookChapter${i}`).textContent = result.books[i].Chapter ?? "";
    }
  });  
}

const searchBar = document.getElementById('searchInput');

function getSearchedBook(){
  return new Promise((resolve,reject) => {
    chrome.storage.local.get(["books"], (result) => {
      const books = result.books || [];
      const selectedBook = books.find(book => book.Title === searchValue);
      if(selectedBook){
        resolve(selectedBook);
      }else{
        reject("Book not found");  
      }
    });
  });
}
function search(event){
  console.log("Typing: ",event.target.value);
  const searchTerm = event.target.value.toLowerCase();
  updateSearch(searchTerm); 
}

function updateSearch(searchTerm){
  chrome.storage.local.get(["books"], (result) => {
    const books = result.books || [];
    const filteredBooks = books.filter(book => book.Title.toLowerCase().startsWith(searchTerm));
    console.log(`Books: ${filteredBooks.Title}`);
    const dropdown = document.getElementById('searchDropdown');
    const dropdownContent = document.getElementById('dropdownContent'); 
    dropdownContent.innerHTML = '';
    if(filteredBooks.length === 0 || searchTerm === ''){
      dropdown.classList.remove('is-active');
      return;
    }
    filteredBooks.forEach(book => {
      const a = document.createElement('a');
      a.className = 'dropdown-item';
      a.textContent = book.Title ?? "No book found";
      a.addEventListener("click", () =>{
        document.getElementById("searchInput").value = book.Title;
        searchValue = book.Title;
        dropdown.classList.remove("is-active")
        });
      dropdownContent.appendChild(a);

      });
    dropdown.classList.add("is-active");
    });
}

document.addEventListener('click',(e) =>{
  if(!document.getElementById("searchContainer").contains(e.target)){
    dropdown.classList.remove("is-active");
  }
})
document.getElementById("bookmark").addEventListener("click", async function(){
  const newBook = {};
  const title = await getTitle();
  console.log(title);
  const words = title.split(" ");
  let fullTitle;
  let chapter;
  for(const  [index,word] of words.entries()){
    if(word == "Chapter" || word === "chapter"){
      chapter = words[index+ 1];
      fullTitle = words.slice(0,index).join(" ");
      break;
    }
  }
  newBook.Title = fullTitle;
  newBook.Chapter = chapter;

  addBookToLibrary(newBook);
  console.log(chapter);
  console.log(fullTitle);
});



document.getElementById("searchInput").addEventListener("keydown", async function(event){
  if(event.key === "Enter"){
    console.log("press enter");
    document.querySelector("#bookSearchInfo").classList.remove("is-hidden");
    const displayBook = await getSearchedBook();
    console.log(displayBook.Title);
    document.getElementById("searchBookTitle").textContent = displayBook.Title;
    document.getElementById("searchBookChapter").textContent = displayBook.Chapter;

  }
});

//Libary
function library(){
  document.querySelector("#mainPage").classList.add("is-hidden");
  document.querySelector("#Library").classList.remove("is-hidden");
}
function mainPage(){
  document.querySelector("#mainPage").classList.remove("is-hidden");
  document.querySelector("#Library").classList.add("is-hidden");
}
document.getElementById("viewLibrary").addEventListener("click",library);
document.getElementById("viewLibrary").addEventListener("click",displayRecentlyBookmarked);
document.getElementById("mainPageButton").addEventListener("click", mainPage);
document.getElementById("searchInput").addEventListener("input",search);
document.getElementById("removeBook").addEventListener("click", () =>  {
  
});
