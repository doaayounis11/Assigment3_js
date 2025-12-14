var fullNameInput = document.getElementById("fullName");
var phoneNumInput = document.getElementById("phoneNum");
var emailAddressInput = document.getElementById("emailAddress");
var addressInput = document.getElementById("address");
var groupInput = document.getElementById("group");
var noteInput = document.getElementById("note");
var imageInput = document.getElementById("contactImage");
var favoriteInput = document.getElementById('checkFav');
var emergencyInput = document.getElementById('checkEmergency');
var searchInput = document.getElementById("searchInput");

let contactList = [];
let editIndex = null;

window.onload = function() {
    const storedContacts = localStorage.getItem('contactList');
    if (storedContacts) {
        contactList = JSON.parse(storedContacts);
        renderAll();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('contactList', JSON.stringify(contactList));
}

function validateContact(contact) {
    document.getElementById("fullNameError").textContent = "";
    document.getElementById("phoneNumError").textContent = "";
    document.getElementById("emailAddressError").textContent = "";

    var valid = true;
    var namePattern = /^[A-Za-z\s]{2,50}$/;
    if (!namePattern.test(contact.name.trim())) {
        document.getElementById("fullNameError").textContent = "Name should contain only letters and spaces (2-50 characters).";
        valid = false;
    }

    var phonePattern = /^(010|011|012|015)[0-9]{8}$/;
    if (!phonePattern.test(contact.phone.trim())) {
        document.getElementById("phoneNumError").textContent = "Please enter a valid Egyptian phone number.";
         Swal.fire({
            icon: 'warning',
            title: 'Invalid Name',
            text: 'Please enter a valid Egyptian phone number (e.g., 01012345678 or +201012345678)'
        });
        valid = false;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contact.email.trim() !== "" && !emailPattern.test(contact.email.trim())) {
        document.getElementById("emailAddressError").textContent = "Please enter a valid email address.";
         Swal.fire({
            icon: 'warning',
            title: 'Invalid Phone',
            text: 'Please enter a valid Egyptian phone number (e.g., 01012345678 or +201012345678)'
        });
        valid = false;
    }

     if (editIndex === null && contactList.some(c => c.phone === contact.phone.trim())) {
        Swal.fire({
            icon: 'warning',
            title: 'Duplicate Phone',
            text: 'This phone number is already in your contacts.'
        });
        return false;
    }

    return valid;
}

function addContact() {
    let contact = {
        name: fullNameInput.value,
        phone: phoneNumInput.value,
        email: emailAddressInput.value,
        adress: addressInput.value,
        group: groupInput.value,
        note: noteInput.value,
        favorite: favoriteInput.checked,
        emergency: emergencyInput.checked,
        image: ""
    };

    if (imageInput.files && imageInput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            contact.image = e.target.result;
            saveContact(contact);
        }
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveContact(contact);
    }
}

function saveContact(contact) {
    if (!validateContact(contact)) return;

    const modalElement = document.getElementById('addContactModal'); 
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    let action = '';

    if (editIndex === null) {
        contactList.push(contact);
        action = 'added';
    } else {
        contactList[editIndex] = contact;
        action = 'updated';
    }

    saveToLocalStorage();
    renderAll();
    resetForm();
    editIndex = null;
    modalInstance.hide();
}

function resetForm() {
    fullNameInput.value = '';
    phoneNumInput.value = '';
    emailAddressInput.value = '';
    addressInput.value = '';
    groupInput.value = '';
    noteInput.value = '';
    imageInput.value = '';
    favoriteInput.checked = false;
    emergencyInput.checked = false;

    document.getElementById("fullNameError").textContent = "";
    document.getElementById("phoneNumError").textContent = "";
    document.getElementById("emailAddressError").textContent = "";
}

function editContactHandler(index) {
    editIndex = index;
    const contact = contactList[index];
    fullNameInput.value = contact.name;
    phoneNumInput.value = contact.phone;
    emailAddressInput.value = contact.email;
    addressInput.value = contact.adress;
    groupInput.value = contact.group;
    noteInput.value = contact.note;
    favoriteInput.checked = contact.favorite;
    emergencyInput.checked = contact.emergency;
    const modal = new bootstrap.Modal(document.getElementById("addContactModal"));
    modal.show();
}

function deleteContactHandler(index) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#607CB2',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'}).then((result) => {
        if (result.isConfirmed) {
            contactList.splice(index, 1);
            saveToLocalStorage();
            renderAll();
            Swal.fire('Deleted!', 'Contact has been deleted.', 'success');
        }
    });
}

function toggleFavorite(index) {
    contactList[index].favorite = !contactList[index].favorite;
    saveToLocalStorage();
    renderAll();
}

function toggleEmergency(index) {
    contactList[index].emergency = !contactList[index].emergency;
    saveToLocalStorage();
    renderAll();
}

function getInitials(name) {
    let initials = '';
    if (name) {
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            initials = parts[0].charAt(0).toUpperCase();
        } else {
            initials = parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
        }
    }
    return initials;
}

function renderCards() {
    let container = document.getElementById("cardsContainer");
    let emptyMessage = document.getElementById("emptyMessage");
    container.innerHTML = "";

    if (contactList.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }
    emptyMessage.style.display = "none";

    contactList.forEach((contact, i) => {
        let initials = getInitials(contact.name);

        container.innerHTML += `
        <div class="col-lg-6 d-flex">
            <div class="contact-card p-4 bg-white shadow-sm rounded-4 h-100 w-100">

                <div class="d-flex align-items-center gap-3 mb-3">
                    ${contact.image ? 
                        `<img src="${contact.image}" class="rounded-3" style="width:50px;height:50px;object-fit:cover;border:2px solid #ddd;">`
                        : `<div class="rounded-3 d-flex justify-content-center align-items-center"
                                style="width:50px;height:50px;background:#007bff;color:white;font-weight:bold;font-size:22px;">
                                ${initials}
                           </div>`}

                    <div>
                        <h5 class="fw-semibold mb-1">${contact.name}</h5>
                        <div class="d-flex align-items-center gap-2">
                            <i class="fa-solid fa-phone text-primary small"></i>
                            <span class="text-muted small">${contact.phone}</span>
                        </div>
                    </div>
                </div>

                <div class="d-flex align-items-center gap-2 mt-1">
                    <i class="fa-solid fa-envelope small email"></i>
                    <span class="text-muted small">${contact.email}</span>
                </div>

                <div class="d-flex align-items-center gap-2 mt-1">
                    <i class="fa-solid fa-location-dot text-success small"></i>
                    <span class="text-muted small">${contact.adress}</span>
                </div>

                <div class="d-flex gap-2 flex-wrap mt-2">
                    ${contact.group ? `<span class="badge bg-primary">${contact.group}</span>` : ""}
                    ${contact.favorite ? `<span class="badge bg-warning text-dark">Favorite</span>` : ""}
                    ${contact.emergency ? `<span class="badge bg-danger">Emergency</span>` : ""}
                </div>

                <div class="FOOTER-CARD d-flex justify-content-between pt-3 mt-3 w-100">
                    <div class="contact d-flex gap-2">
                        <a href="tel:${contact.phone}" class="footer-icon call text-success">
                            <i class="fa-solid fa-phone"></i>
                        </a>
                        <a href="mailto:${contact.email}" class="footer-icon email">
                            <i class="fa-solid fa-envelope"></i>
                        </a>
                    </div>

                    <div class="modify d-flex gap-2">
                        <button onclick="toggleFavorite(${i})" class="footer-icon favorite">
                            <i class="fa-solid fa-star ${contact.favorite ? 'text-amber-400' : 'text-gray-400'}"></i>
                        </button>
                        <button onclick="toggleEmergency(${i})" class="footer-icon emergency">
                            <i class="fa-solid fa-heart ${contact.emergency ? 'text-red-500' : 'text-gray-400'}"></i>
                        </button>
                        <button onclick="editContactHandler(${i})" class="footer-icon edit">
                            <i class="fa-solid fa-pen-to-square text-gray-500"></i>
                        </button>
                        <button onclick="deleteContactHandler(${i})" class="footer-icon delete">
                            <i class="fa-solid fa-trash-can text-gray-500"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>`;
    });
}


function renderFavoriteList() {
    let container = document.getElementById("favList");
    container.innerHTML = "";
    let favContacts = contactList.filter(c => c.favorite);
    if (favContacts.length === 0) {
        container.innerHTML = "<p class='text-muted'>No favorites yet</p>";
        return;
    }
    favContacts.forEach(contact => {
        let initials = getInitials(contact.name);
        container.innerHTML += `
        <div class="fav-card p-2 mb-2 bg-light rounded d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
                ${contact.image ? 
                    `<img src="${contact.image}" class="rounded-circle" style="width:40px;height:40px;object-fit:cover;border:1px solid #ddd;">`
                    : `<div class="rounded-circle d-flex justify-content-center align-items-center" style="width:40px;height:40px;background:#007bff;color:white;font-weight:bold;">${initials}</div>`}
                <div>
                    <h5 class="fw-semibold mb-0">${contact.name}</h5>
                    <p class="mb-0">${contact.phone}</p>
                </div>
            </div>
            <a href="tel:${contact.phone}" class="footer-icon"><i class="fa-solid fa-phone text-primary"></i></a>
        </div>`;
    });
}

function renderEmergencyList() {
    let container = document.getElementById("emergList");
    container.innerHTML = "";
    let emergContacts = contactList.filter(c => c.emergency);
    if (emergContacts.length === 0) {
        container.innerHTML = "<p class='text-muted'>No emergency contacts yet</p>";
        return;
    }
    emergContacts.forEach(contact => {
        let initials = getInitials(contact.name);
        container.innerHTML += `
        <div class="fav-card p-2 mb-2 bg-light rounded d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
                ${contact.image ? 
                    `<img src="${contact.image}" class="rounded-circle" style="width:40px;height:40px;object-fit:cover;border:1px solid #ddd;">`
                    : `<div class="rounded-circle d-flex justify-content-center align-items-center" style="width:40px;height:40px;background:#dc3545;color:white;font-weight:bold;">${initials}</div>`}
                <div>
                    <h5 class="fw-semibold mb-0">${contact.name}</h5>
                    <p class="mb-0">${contact.phone}</p>
                </div>
            </div>
            <a href="tel:${contact.phone}" class="footer-icon"><i class="fa-solid fa-phone text-danger"></i></a>
        </div>`;
    });
}

function updateHeaderCounts() {
    document.getElementById("contactNum").textContent = contactList.length;
    document.getElementById("favoriteNum").textContent = contactList.filter(c => c.favorite).length;
    document.getElementById("emergencyNum").textContent = contactList.filter(c => c.emergency).length;
}

function renderAll() {
    renderCards();
    renderFavoriteList();
    renderEmergencyList();
    updateHeaderCounts();
}





