contactModal = new bootstrap.Modal(document.getElementById("addContactModal"));
var fullNameInput=document.getElementById("fullName");
var phoneNumInput=document.getElementById("phoneNum");
var emailAddressInput=document.getElementById("emailAddress");
var addressInput=document.getElementById("address");
var groupInput=document.getElementById("group");
var noteInput=document.getElementById("note");
var contactImageInput=document.getElementById("contactImage");
var checkFavInput=document.getElementById("checkFav");
var checkEmergencyInput=document.getElementById("checkEmergency");
var btnSave = document.getElementById("btnSave");
var btnUpdate = document.getElementById("btnUpdate");
var editIndex = null;
var searchInput=document.getElementById("searchInput");
var emptyMessage = document.getElementById("emptyMessage");
//save in localStorage
var contacts = contacts=JSON.parse(localStorage.getItem("contacts"))?? [];
renderAll();
// ====== ADD / SAVE CONTACT ======
function addContact(){
 contact= {
    name:fullNameInput.value,
    phone: phoneNumInput.value,
    email: emailAddressInput.value,
    adress:addressInput.value ,
    group: groupInput.value ,
    note: noteInput.value,
    image: contactImageInput.value,
    favorite: checkFavInput.checked,
    emergency: checkEmergencyInput.checked,
 }
  if (!validateContact(contact)) {
        return;
    }
  contacts.push(contact);
   localStorage.setItem("contacts",JSON.stringify(contacts));
   Swal.fire('Added!', 'Contact has been added.', 'success');
  renderAll();
   resetForm();
   contactModal.hide(); 
}
// ====== TOGGLE FAVORITE / EMERGENCY ======
function toggleFavorite(i) {
    contacts[i].favorite = !contacts[i].favorite;
    localStorage.setItem("contacts", JSON.stringify(contacts));
     renderAll();
}
function toggleEmergency(i) {
    contacts[i].emergency = !contacts[i].emergency;
    localStorage.setItem("contacts", JSON.stringify(contacts));
     renderAll();
}

// ====== GET INITIALS ======
function getInitials(name) {
    if (!name || name.trim() === "") {
        return "?";
    }

    var parts = name.trim().split(" ");
    if (parts.length === 1) {
        return parts[0][0].toUpperCase();
    }
    return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
}

// ====== VALIDATION ======
function validateContact(contact) {
    let valid = true;
    document.getElementById("fullNameError").textContent = "";
    document.getElementById("phoneNumError").textContent = "";
    document.getElementById("emailAddressError").textContent = "";
    var namePattern = /^[A-Za-z\s]{2,50}$/;
    if (!namePattern.test(contact.name.trim())) {
        document.getElementById("fullNameError").textContent = "Name should contain only letters and spaces (2-50 characters)";
        valid = false;
    }

    var phonePattern = /^(\+2)?01[0125][0-9]{8}$/;
    if (!phonePattern.test(contact.phone.trim())) {
        document.getElementById("phoneNumError").textContent = "Please enter a valid Egyptian phone number";
        valid = false;
    }

    var emailPattern = /^[A-Za-z0-9_.]+@[A-Za-z0-9]+\.[A-Za-z]{2,5}$/;
    if (contact.email.trim() !== "" && !emailPattern.test(contact.email.trim())) {
        document.getElementById("emailAddressError").textContent = "Please enter a valid email address";
        valid = false;
    }

    // Check duplicate phone on Add
    if (editIndex === null && contacts.some(c => c.phone === contact.phone.trim())) {
        Swal.fire({
            icon: 'warning',
            title: 'Duplicate Phone',
            text: 'This phone number is already in your contacts.'
        });
        valid = false;
    }

    if (!valid) {
        let errorText = "";
        if (document.getElementById("fullNameError").textContent) errorText += document.getElementById("fullNameError").textContent + "<br>";
        if (document.getElementById("phoneNumError").textContent) errorText += document.getElementById("phoneNumError").textContent + "<br>";
        if (document.getElementById("emailAddressError").textContent) errorText += document.getElementById("emailAddressError").textContent + "<br>";

        if (errorText) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                html: errorText
            });
        }
    }

    return valid;
}
// ====== display CARDS/search ======
function displayContact() {
    var searchTerm = searchInput.value.toLowerCase();
    var container = document.getElementById("cardsContainer");
    container.innerHTML = "";
    emptyMessage.classList.add("d-none"); 

    for (var i = 0; i < contacts.length; i++) {
        if (
            contacts[i].name.toLowerCase().includes(searchTerm) ||
            contacts[i].phone.toLowerCase().includes(searchTerm) ||
            contacts[i].email.toLowerCase().includes(searchTerm)
        ) {
            container.innerHTML += `
            <div class="col-lg-6 d-flex">
                <div class="contact-card p-4 bg-white shadow-sm rounded-4 h-100 w-100">

                    <div class="d-flex align-items-center gap-3 mb-3">
                        ${
                            contacts[i].image
                            ? `<img src="${contacts[i].image}" class="rounded-3" style="width:50px;height:50px;object-fit:cover;border:2px solid #ddd;">`
                            : `<div class="rounded-3 d-flex justify-content-center align-items-center"
                                    style="width:50px;height:50px;background:#007bff;color:white;font-weight:bold;font-size:22px;">
                                    ${getInitials(contacts[i].name)}
                               </div>`
                        }
                        <div>
                            <h5 class="fw-semibold mb-1">${contacts[i].name}</h5>
                            <div class="d-flex align-items-center gap-2">
                                <i class="fa-solid fa-phone text-primary small"></i>
                                <span class="text-muted small">${contacts[i].phone}</span>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex align-items-center gap-2 mt-1">
                        <i class="fa-solid fa-envelope small email"></i>
                        <span class="text-muted small">${contacts[i].email}</span>
                    </div>

                    <div class="d-flex align-items-center gap-2 mt-1">
                        <i class="fa-solid fa-location-dot text-success small"></i>
                        <span class="text-muted small">${contacts[i].adress}</span>
                    </div>

                    <div class="d-flex gap-2 flex-wrap mt-2">
                        ${contacts[i].group ? `<span class="badge bg-primary">${contacts[i].group}</span>` : ""}
                        ${contacts[i].favorite ? `<span class="badge bg-warning text-dark">Favorite</span>` : ""}
                        ${contacts[i].emergency ? `<span class="badge bg-danger">Emergency</span>` : ""}
                    </div>

                    <div class="FOOTER-CARD d-flex justify-content-between pt-3 mt-3 w-100">
                        <div class="contact d-flex gap-2">
                            <a href="tel:${contacts[i].phone}" class="footer-icon call text-success">
                                <i class="fa-solid fa-phone"></i>
                            </a>
                            <a href="mailto:${contacts[i].email}" class="footer-icon email">
                                <i class="fa-solid fa-envelope"></i>
                            </a>
                        </div>

                        <div class="modify d-flex gap-2">
                            <button onclick="toggleFavorite(${i})" class="footer-icon favorite">
                                <i class="fa-solid fa-star ${contacts[i].favorite ? 'text-amber-400' : 'text-gray-400'}"></i>
                            </button>
                            <button onclick="toggleEmergency(${i})" class="footer-icon emergency">
                                <i class="fa-solid fa-heart ${contacts[i].emergency ? 'text-red-500' : 'text-gray-400'}"></i>
                            </button>
                            <button onclick="editContactInfo(${i})" class="footer-icon edit">
                                <i class="fa-solid fa-pen-to-square text-gray-500"></i>
                            </button>
                            <button onclick="deleteContact(${i})" class="footer-icon delete">
                                <i class="fa-solid fa-trash-can text-gray-500"></i>
                            </button>
                        </div>
                    </div>

                </div>
            </div>`;
        }
    }

    if (container.innerHTML === "") {
        emptyMessage.classList.remove("d-none");
    }
}


// ====== RESET FORM ======
function resetForm() {
    fullNameInput.value = "";
    phoneNumInput.value = "";
    emailAddressInput.value = "";
    addressInput.value = "";
    groupInput.value = "";
    noteInput.value = "";
    contactImageInput.value = "";
    checkFavInput.checked = false;
    checkEmergencyInput.checked = false;
}
// ====== DELETE ======
function deleteContact(i) {
    Swal.fire({
        title: "Delete Contact?",
        text: `Are you sure you want to delete ${contacts[i].name}? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "gray",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            contacts.splice(i, 1);
            localStorage.setItem("contacts", JSON.stringify(contacts));
             renderAll(); 
            Swal.fire({
                title: "Deleted!",
                text: "The contact has been deleted.",
                icon: "success"
            });
        }
    });

}
//=========edit====================
function editContactInfo(i){
    editIndex=i;
    fullNameInput.value=contacts[i].name;
    phoneNumInput.value= contacts[i].phone ;
    emailAddressInput.value=contacts[i].email;
    addressInput.value= contacts[i].adress;
    groupInput.value= contacts[i].group;
    noteInput.value= contacts[i].note;
    checkFavInput.checked= contacts[i].favorite;
    checkEmergencyInput.checked=contacts[i].emergency;
    btnSave.classList.add("d-none");
    btnUpdate.classList.remove("d-none");
    contactModal.show();
}
function editContact(){
    contact= {
    name:fullNameInput.value,
    phone: phoneNumInput.value,
    email: emailAddressInput.value,
    adress:addressInput.value ,
    group: groupInput.value ,
    note: noteInput.value,
    image: contactImageInput.value,
    favorite: checkFavInput.checked,
    emergency: checkEmergencyInput.checked,
 } 
 if (!validateContact(contact)) {
    return;
}
  contacts.splice( editIndex,1,contact)
   localStorage.setItem("contacts",JSON.stringify(contacts));
    Swal.fire('Updated!', 'Contact has been updated.', 'success');
     contactModal.hide();
    renderAll(); 
   

}

// ====== HEADER COUNTS ======
function updateHeaderCounts() {
    document.getElementById("contactNum").textContent = contacts.length;

    document.getElementById("favoriteNum").textContent = contacts.filter(c => c.favorite).length;

    document.getElementById("emergencyNum").textContent =contacts.filter(c => c.emergency).length;
}
// ====== FAVORITES / EMERGENCY LIST ======
function renderFavoriteList() {
    var container = document.getElementById("favList");
    container.innerHTML = "";

    let favContacts = contacts.filter(c => c.favorite);

    if (favContacts.length === 0) {
        container.innerHTML = "<p class='text-muted'>No favorites yet</p>";
        return;
    }

    for (var i = 0; i < favContacts.length; i++) {
        let contact = favContacts[i];
        let initials = getInitials(contact.name);

        container.innerHTML += `
        <div class="fav-card p-2 mb-2 bg-light rounded d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
                ${
                    contact.image
                    ? `<img src="${contact.image}" class="rounded-circle" style="width:40px;height:40px;object-fit:cover;border:1px solid #ddd;">`
                    : `<div class="rounded-circle d-flex justify-content-center align-items-center bg-warning"
                        style="width:40px;height:40px;color:white;font-weight:bold;">
                        ${initials}
                       </div>`
                }
                <div>
                    <h6 class="fw-semibold mb-0">${contact.name}</h6>
                    <p class="mb-0 small">${contact.phone}</p>
                </div>
            </div>

            <a href="tel:${contact.phone}" class="footer-icon">
                <i class="fa-solid fa-phone text-warning"></i>
            </a>
        </div>`;
    }
}
function renderemergancyList() {
    var container = document.getElementById("emergList");
    container.innerHTML = "";

    let emergencyContacts = contacts.filter(c => c.emergency);

    if (emergencyContacts.length === 0) {
        container.innerHTML = "<p class='text-muted'>No emergency contacts</p>";
        return;
    }

    for (var i = 0; i < emergencyContacts.length; i++) {
        let contact = emergencyContacts[i];
        let initials = getInitials(contact.name);

        container.innerHTML += `
        <div class="fav-card p-2 mb-2 bg-light rounded d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
                ${
                    contact.image
                    ? `<img src="${contact.image}" class="rounded-circle" style="width:40px;height:40px;object-fit:cover;border:1px solid #ddd;">`
                    : `<div class="rounded-circle d-flex justify-content-center align-items-center"
                        style="width:40px;height:40px;background:red;color:white;font-weight:bold;">
                        ${initials}
                       </div>`
                }
                <div>
                    <h6 class="fw-semibold mb-0">${contact.name}</h6>
                    <p class="mb-0 small">${contact.phone}</p>
                </div>
            </div>

            <a href="tel:${contact.phone}" class="footer-icon">
                <i class="fa-solid fa-phone text-danger"></i>
            </a>
        </div>`;
    }
}
//===================render ================
function renderAll(){
 displayContact();
updateHeaderCounts(); 
renderFavoriteList();
renderemergancyList();
}









