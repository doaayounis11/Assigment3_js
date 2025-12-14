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
var contactList = [];
var editIndex = null;

if (localStorage.getItem("contactList")) {
    contactList = JSON.parse(localStorage.getItem("contactList"));
}
renderAll();

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

    var phonePattern = /^(010|011|012|015)[0-9]{8}$/;
    if (!phonePattern.test(contact.phone.trim())) {
        document.getElementById("phoneNumError").textContent = "Please enter a valid Egyptian phone number";
        valid = false;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contact.email.trim() !== "" && !emailPattern.test(contact.email.trim())) {
        document.getElementById("emailAddressError").textContent = "Please enter a valid email address";
        valid = false;
    }

    // Check duplicate phone on Add
    if (editIndex === null && contactList.some(c => c.phone === contact.phone.trim())) {
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

// ====== ADD / SAVE CONTACT ======
function addContact() {
    var contact = {
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
        var reader = new FileReader();
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

    if (editIndex === null) {
        contactList.push(contact);
        Swal.fire('Added!', 'Contact has been added.', 'success');
    } else {
        contactList[editIndex] = contact;
        Swal.fire('Updated!', 'Contact has been updated.', 'success');
        editIndex = null;
    }

    localStorage.setItem("contactList", JSON.stringify(contactList));
    renderAll();
    resetForm();
    modalInstance.hide();
}

// ====== RESET FORM ======
function resetForm() {
    fullNameInput.value = "";
    phoneNumInput.value = "";
    emailAddressInput.value = "";
    addressInput.value = "";
    groupInput.value = "";
    noteInput.value = "";
    imageInput.value = "";
    favoriteInput.checked = false;
    emergencyInput.checked = false;

    document.getElementById("fullNameError").textContent = "";
    document.getElementById("phoneNumError").textContent = "";
    document.getElementById("emailAddressError").textContent = "";
}

// ====== EDIT ======
function editContactHandler(i) {
    editIndex = i;
    var c = contactList[i];
    fullNameInput.value = c.name;
    phoneNumInput.value = c.phone;
    emailAddressInput.value = c.email;
    addressInput.value = c.adress;
    groupInput.value = c.group;
    noteInput.value = c.note;
    favoriteInput.checked = c.favorite;
    emergencyInput.checked = c.emergency;

    var modal = new bootstrap.Modal(document.getElementById("addContactModal"));
    modal.show();
}

// ====== DELETE ======
function deleteContactHandler(i) {
    Swal.fire({
        title: "Delete Contact?",
        text: `Are you sure you want to delete ${contactList[i].name}? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "gray",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            contactList.splice(i, 1);
            localStorage.setItem("contactList", JSON.stringify(contactList));
            renderAll();
            Swal.fire({
                title: "Deleted!",
                text: "The contact has been deleted.",
                icon: "success"
            });
        }
    });
}

// ====== TOGGLE FAVORITE / EMERGENCY ======
function toggleFavorite(i) {
    contactList[i].favorite = !contactList[i].favorite;
    localStorage.setItem("contactList", JSON.stringify(contactList));
    renderAll();
}
function toggleEmergency(i) {
    contactList[i].emergency = !contactList[i].emergency;
    localStorage.setItem("contactList", JSON.stringify(contactList));
    renderAll();
}

// ====== GET INITIALS ======
function getInitials(name) {
    var parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return parts[0][0].toUpperCase() + parts[parts.length-1][0].toUpperCase();
}

// ====== RENDER ======
function renderAll() {
    renderCards(contactList);
    renderFavoriteList();
    renderEmergencyList();
    updateHeaderCounts();
}

// ====== RENDER CARDS ======
function renderCards(list) {
    var container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    list.forEach((contact, i) => {
        var initials = getInitials(contact.name);

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

// ====== SEARCH ======
function searchContacts() {
    var value = searchInput.value.toLowerCase().trim();
    if (!value) return renderAll();

    var filtered = contactList.filter(c => 
        c.name.toLowerCase().includes(value) ||
        c.phone.includes(value) ||
        c.email.toLowerCase().includes(value)
    );

    renderCards(filtered);
}

// ====== FAVORITES / EMERGENCY LIST ======
function renderFavoriteList() {
    var container = document.getElementById("favList");
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
    var container = document.getElementById("emergList");
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

// ====== HEADER COUNTS ======
function updateHeaderCounts() {
    document.getElementById("contactNum").textContent = contactList.length;
    document.getElementById("favoriteNum").textContent = contactList.filter(c => c.favorite).length;
    document.getElementById("emergencyNum").textContent = contactList.filter(c => c.emergency).length;
}





