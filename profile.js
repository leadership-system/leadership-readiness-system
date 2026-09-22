// ==========================================
// PROFILE SYSTEM
// ==========================================

const profileForm =
    document.getElementById("profileForm");

const message =
    document.getElementById("message");

// PROFILE DROPDOWN
const profileBtn =
    document.getElementById("profileBtn");

const profileDropdown =
    document.getElementById("profileDropdown");

const dropdownName =
    document.getElementById("dropdownName");

const dropdownStaffId =
    document.getElementById("dropdownStaffId");

const dropdownLogoutBtn =
    document.getElementById("dropdownLogoutBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// HELPER
// ==========================================

function setText(element, value) {

    if (!element) return;

    element.textContent =
        value !== null &&
        value !== undefined &&
        value !== ""
            ? value
            : "-";
}


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {

        window.location.href = "index.html";

        return;
    }

    await loadProfile(user);
}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile(user) {

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();


    if (error) {

        console.error(
            "Load profile error:",
            error
        );

        if (message) {

            message.innerText =
                "Unable to load profile information.";

            message.style.color = "red";

        }

        return;
    }


    if (data) {

        // ==========================================
        // FORM DATA
        // ==========================================

        document.getElementById("staff_id").value =
            data.staff_id || "";

        document.getElementById("title").value =
            data.title || "";

        document.getElementById("full_name").value =
            data.full_name || "";

        document.getElementById("gender").value =
            data.gender || "";

        document.getElementById("age").value =
            data.age ?? "";

        document.getElementById("email").value =
            data.email || user.email || "";

        document.getElementById("phone").value =
            data.phone || "";

        document.getElementById("service_years").value =
            data.service_years ?? "";


        // ==========================================
        // PROFILE DROPDOWN
        // ==========================================

        setText(
            dropdownName,
            data.full_name
        );

        setText(
            dropdownStaffId,
            data.staff_id
        );

    }
}


// ==========================================
// SAVE / UPDATE PROFILE
// ==========================================

profileForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();
        event.stopPropagation();


        message.innerText =
            "Menyimpan...";

        message.style.color =
            "black";


        try {

            // ==========================================
            // GET CURRENT USER
            // ==========================================

            const {
                data: { user },
                error: userError
            } = await supabaseClient.auth.getUser();


            if (userError) {

                throw userError;

            }


            if (!user) {

                window.location.href =
                    "index.html";

                return;

            }


            // ==========================================
            // GET FORM VALUES
            // ==========================================

            const staffID =
                document
                    .getElementById("staff_id")
                    .value
                    .trim();

            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();

            const fullName =
                document
                    .getElementById("full_name")
                    .value
                    .trim();

            const gender =
                document
                    .getElementById("gender")
                    .value;

            const ageValue =
                document
                    .getElementById("age")
                    .value;

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();

            const serviceYearsValue =
                document
                    .getElementById("service_years")
                    .value;


            // ==========================================
            // PREPARE DATA
            // ==========================================

            const profileData = {

                id: user.id,

                staff_id: staffID,

                title: title,

                full_name: fullName,

                gender: gender,

                age:
                    ageValue
                        ? Number(ageValue)
                        : null,

                email: email,

                phone: phone,

                service_years:
                    serviceYearsValue
                        ? Number(serviceYearsValue)
                        : null,

                updated_at:
                    new Date().toISOString()

            };


            console.log(
                "Saving profile:",
                profileData
            );


            // ==========================================
            // SAVE TO SUPABASE
            // ==========================================

            const {
                data,
                error
            } = await supabaseClient
                .from("profiles")
                .upsert(
                    profileData,
                    {
                        onConflict: "id"
                    }
                )
                .select();


            // ==========================================
            // CHECK ERROR
            // ==========================================

            if (error) {

                console.error(
                    "Save profile error:",
                    error
                );

                message.innerText =
                    "Failed to save information: " +
                    error.message;

                message.style.color =
                    "red";

                return;

            }


            // ==========================================
            // SUCCESS
            // ==========================================

            console.log(
                "Profile saved:",
                data
            );

            message.innerText =
                "Maklumat Peribadi berjaya disimpan!";

            message.style.color =
                "green";


            // Update dropdown immediately
            setText(
                dropdownName,
                fullName
            );

            setText(
                dropdownStaffId,
                staffID
            );


        } catch (error) {

            console.error(
                "Profile error:",
                error
            );

            message.innerText =
                "Gagal kemaskini data: " +
                error.message;

            message.style.color =
                "red";

        }

    }
);


// ==========================================
// LOGOUT - SIDEBAR
// ==========================================

logoutBtn?.addEventListener(
    "click",
    async function () {

        try {

            const { error } =
                await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }

            window.location.href = "index.html";

        } catch (error) {

            console.error(
                "Sidebar logout error:",
                error
            );

            alert("Gagal log keluar.");

        }

    }
);

// ==========================================
// PROFILE DROPDOWN
// ==========================================

profileBtn?.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        profileDropdown?.classList.toggle("show");

    }
);


document.addEventListener(
    "click",
    function() {

        profileDropdown?.classList.remove("show");

    }
);


// ==========================================
// START
// ==========================================

checkUser();