// ==========================================
// ADMIN DASHBOARD.JS
// Leadership Readiness System
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const adminName =
    document.getElementById("adminName");

const welcomeAdminName =
    document.getElementById("welcomeAdminName");

const totalStaff =
    document.getElementById("totalStaff");

const totalPka =
    document.getElementById("totalPka");

const totalPki =
    document.getElementById("totalPki");

const totalLeadership =
    document.getElementById("totalLeadership");

const totalVisibility =
    document.getElementById("totalVisibility");

const staffTableBody =
    document.getElementById("staffTableBody");

const staffSearch =
    document.getElementById("staffSearch");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// GLOBAL DATA
// ==========================================

let allStaff = [];


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            // ==========================================
            // CHECK SESSION
            // ==========================================

            const {
                data: { session },
                error: sessionError
            } =
                await supabaseClient
                    .auth
                    .getSession();


            if (sessionError) {
                throw sessionError;
            }


            if (!session) {

                window.location.href =
                    "index.html";

                return;
            }


            const userId =
                session.user.id;


            console.log(
                "CURRENT USER:",
                userId
            );


            // ==========================================
            // GET ADMIN PROFILE
            // ==========================================

            const {
                data: adminProfile,
                error: adminError
            } =
                await supabaseClient
                    .from("profiles")
                    .select(`
                        id,
                        staff_id,
                        full_name,
                        email,
                        role
                    `)
                    .eq("id", userId)
                    .maybeSingle();


            if (adminError) {
                throw adminError;
            }


            console.log(
                "ADMIN PROFILE:",
                adminProfile
            );


            if (!adminProfile) {

                alert(
                    "Profil admin tidak dijumpai."
                );

                return;
            }


            // ==========================================
            // CHECK ADMIN ROLE
            // ==========================================

            if (
                adminProfile.role !== "admin"
            ) {

                alert(
                    "Akses ditolak. Halaman ini hanya untuk Admin."
                );

                window.location.href =
                    "dashboard.html";

                return;
            }


            // ==========================================
            // DISPLAY ADMIN NAME
            // ==========================================

            const name =
                adminProfile.full_name ||
                "Admin";


            if (adminName) {

                adminName.textContent =
                    name;

            }


            if (welcomeAdminName) {

                welcomeAdminName.textContent =
                    name;

            }


            // ==========================================
            // LOAD STAFF
            // ==========================================

            await loadStaff();


        } catch (error) {

            console.error(
                "Admin Dashboard Error:",
                error
            );

            alert(
                "Terdapat masalah ketika memuatkan Admin Dashboard.\n\n" +
                error.message
            );

        }

    }
);


// ==========================================
// LOAD STAFF
// ==========================================

async function loadStaff() {

    try {

        console.log(
            "========== LOAD ADMIN DATA =========="
        );


        // ==========================================
        // 1. PROFILES
        // ==========================================

        const {
            data: profiles,
            error: profilesError
        } =
            await supabaseClient
                .from("profiles")
                .select(`
                    id,
                    staff_id,
                    full_name,
                    email,
                    role
                `)
                .eq("role", "staff")
                .order("full_name", {
                    ascending: true
                });


        if (profilesError) {
            throw profilesError;
        }


        console.log(
            "PROFILES:",
            profiles
        );


        if (!profiles || profiles.length === 0) {

            allStaff = [];

            updateSummary();

            renderStaffTable([]);

            return;
        }


        // ==========================================
        // USER IDS
        // ==========================================

        const userIds =
            profiles.map(
                staff => staff.id
            );


        // ==========================================
        // 2. EMPLOYMENT
        // ==========================================

        const {
            data: employmentData,
            error: employmentError
        } =
            await supabaseClient
                .from("employment")
                .select(`
                    user_id,
                    salary_grade,
                    appointment_date,
                    retirement_date,
                    original_department,
                    current_department,
                    original_position,
                    current_position
                `)
                .in(
                    "user_id",
                    userIds
                );


        if (employmentError) {

            console.error(
                "Employment Error:",
                employmentError
            );

        }


        // ==========================================
        // 3. USER TRAINING
        // ==========================================

        const {
            data: userTrainingData,
            error: trainingError
        } =
            await supabaseClient
                .from("user_training")
                .select(`
                    id,
                    user_id,
                    course_id,
                    module_id,
                    attendance,
                    training_year,
                    evidence_url
                `)
                .in(
                    "user_id",
                    userIds
                );


        if (trainingError) {

            console.error(
                "User Training Error:",
                trainingError
            );

        }


        // ==========================================
        // 4. TRAINING COURSES
        // ==========================================

        const {
            data: coursesData,
            error: coursesError
        } =
            await supabaseClient
                .from("training_courses")
                .select(`
                    id,
                    course_code,
                    course_name,
                    course_type,
                    is_mandatory
                `);


        if (coursesError) {

            console.error(
                "Training Courses Error:",
                coursesError
            );

        }


        // ==========================================
        // 5. TRAINING MODULES
        // ==========================================

        const {
            data: modulesData,
            error: modulesError
        } =
            await supabaseClient
                .from("training_modules")
                .select(`
                    id,
                    course_id,
                    module_no,
                    module_name,
                    is_mandatory
                `);


        if (modulesError) {

            console.error(
                "Training Modules Error:",
                modulesError
            );

        }


        // ==========================================
        // 6. ACADEMIC LEADERSHIP
        // ==========================================

        const {
            data: leadershipData,
            error: leadershipError
        } =
            await supabaseClient
                .from("academic_leadership_history")
                .select(`
                    id,
                    user_id,
                    position_name,
                    start_date,
                    end_date,
                    duration_years,
                    score,
                    total_score
                `)
                .in(
                    "user_id",
                    userIds
                );


        if (leadershipError) {

            console.error(
                "Academic Leadership Error:",
                leadershipError
            );

        }


        // ==========================================
        // 7. ACADEMIC VISIBILITY
        // ==========================================

        const {
            data: visibilityData,
            error: visibilityError
        } =
            await supabaseClient
                .from("academic_visibility")
                .select(`
                    id,
                    user_id,
                    category,
                    activity_type,
                    scope,
                    institution,
                    thesis_level,
                    review_type,
                    role,
                    year
                `)
                .in(
                    "user_id",
                    userIds
                );


        if (visibilityError) {

            console.error(
                "Academic Visibility Error:",
                visibilityError
            );

        }


        // ==========================================
        // 8. COMBINE DATA
        // ==========================================

        allStaff =
            profiles.map(staff => {

                const userId =
                    staff.id;


                // Employment
                const employment =
                    (employmentData || [])
                        .find(
                            item =>
                                item.user_id === userId
                        );


                // Training
                const training =
                    (userTrainingData || [])
                        .filter(
                            item =>
                                item.user_id === userId
                        );


                // Leadership
                const leadership =
                    (leadershipData || [])
                        .filter(
                            item =>
                                item.user_id === userId
                        );


                // Visibility
                const visibility =
                    (visibilityData || [])
                        .filter(
                            item =>
                                item.user_id === userId
                        );


                return {

                    ...staff,

                    employment:
                        employment || null,

                    training:
                        training,

                    leadership:
                        leadership,

                    visibility:
                        visibility

                };

            });


        // ==========================================
        // STORE COURSE/MODULE DATA
        // ==========================================

        window.trainingCourses =
            coursesData || [];


        window.trainingModules =
            modulesData || [];


        console.log(
            "TRAINING COURSES:",
            window.trainingCourses
        );


        console.log(
            "TRAINING MODULES:",
            window.trainingModules
        );


        console.log(
            "FINAL STAFF DATA:",
            allStaff
        );


        // ==========================================
        // UPDATE SUMMARY
        // ==========================================

        updateSummary();


        // ==========================================
        // RENDER TABLE
        // ==========================================

        renderStaffTable(
            allStaff
        );


    } catch (error) {

        console.error(
            "LOAD STAFF ERROR:",
            error
        );


        if (staffTableBody) {

            staffTableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Gagal memuatkan data staf.
                        <br>
                        ${escapeHtml(
                            error.message
                        )}
                    </td>
                </tr>
            `;

        }

    }

}


// ==========================================
// CHECK ATTENDANCE
// ==========================================

function isAttended(value) {

    if (!value) {
        return false;
    }


    const text =
        String(value)
            .trim()
            .toLowerCase();


    return (
        text === "ya" ||
        text === "yes" ||
        text === "hadir" ||
        text === "attended" ||
        text === "complete" ||
        text === "completed"
    );

}


// ==========================================
// GET COURSE
// ==========================================

function getCourse(courseId) {

    return (
        window.trainingCourses || []
    ).find(
        course =>
            course.id === courseId
    );

}


// ==========================================
// GET MODULE
// ==========================================

function getModule(moduleId) {

    return (
        window.trainingModules || []
    ).find(
        module =>
            module.id === moduleId
    );

}


// ==========================================
// CHECK PKA
// ==========================================

function isPKA(course) {

    if (!course) {
        return false;
    }


    const type =
        String(
            course.course_type || ""
        ).toLowerCase();


    const code =
        String(
            course.course_code || ""
        ).toLowerCase();


    const name =
        String(
            course.course_name || ""
        ).toLowerCase();


    return (
        type.includes("pka") ||
        code.includes("pka") ||
        name.includes("pka")
    );

}


// ==========================================
// CHECK PKI
// ==========================================

function isPKI(course) {

    if (!course) {
        return false;
    }


    const type =
        String(
            course.course_type || ""
        ).toLowerCase();


    const code =
        String(
            course.course_code || ""
        ).toLowerCase();


    const name =
        String(
            course.course_name || ""
        ).toLowerCase();


    return (
        type.includes("pki") ||
        code.includes("pki") ||
        name.includes("pki")
    );

}


// ==========================================
// GET PKA PROGRESS
// ==========================================

function getPKAProgress(staff) {

    const training =
        staff.training || [];


    const pkaCourses =
        (window.trainingCourses || [])
            .filter(
                course =>
                    isPKA(course)
            );


    const pkaCourseIds =
        pkaCourses.map(
            course =>
                course.id
        );


    const pkaTraining =
        training.filter(
            item =>
                pkaCourseIds.includes(
                    item.course_id
                )
        );


    // Modules yang telah dihadiri
    const completed =
        pkaTraining.filter(
            item =>
                isAttended(
                    item.attendance
                )
        ).length;


    // Jumlah module PKA
    const totalModules =
        (window.trainingModules || [])
            .filter(
                module =>
                    pkaCourseIds.includes(
                        module.course_id
                    )
            ).length;


    if (
        completed === 0 &&
        totalModules === 0
    ) {

        return "0/0";

    }


    return (
        completed +
        "/" +
        totalModules
    );

}


// ==========================================
// GET PKI PROGRESS
// ==========================================

function getPKIProgress(staff) {

    const training =
        staff.training || [];


    const pkiCourses =
        (window.trainingCourses || [])
            .filter(
                course =>
                    isPKI(course)
            );


    const pkiCourseIds =
        pkiCourses.map(
            course =>
                course.id
        );


    const pkiTraining =
        training.filter(
            item =>
                pkiCourseIds.includes(
                    item.course_id
                )
        );


    const completed =
        pkiTraining.filter(
            item =>
                isAttended(
                    item.attendance
                )
        ).length;


    const totalModules =
        (window.trainingModules || [])
            .filter(
                module =>
                    pkiCourseIds.includes(
                        module.course_id
                    )
            ).length;


    if (
        completed === 0 &&
        totalModules === 0
    ) {

        return "0/0";

    }


    return (
        completed +
        "/" +
        totalModules
    );

}


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {

    // ==========================================
    // TOTAL STAFF
    // ==========================================

    if (totalStaff) {

        totalStaff.textContent =
            allStaff.length;

    }


    // ==========================================
    // PKA
    // ==========================================

    let pkaStaff = 0;


    allStaff.forEach(staff => {

        const progress =
            getPKAProgress(staff);


        const parts =
            progress.split("/");


        const completed =
            Number(parts[0]);


        if (completed > 0) {

            pkaStaff++;

        }

    });


    if (totalPka) {

        totalPka.textContent =
            pkaStaff;

    }


    // ==========================================
    // PKI
    // ==========================================

    let pkiStaff = 0;


    allStaff.forEach(staff => {

        const progress =
            getPKIProgress(staff);


        const parts =
            progress.split("/");


        const completed =
            Number(parts[0]);


        if (completed > 0) {

            pkiStaff++;

        }

    });


    if (totalPki) {

        totalPki.textContent =
            pkiStaff;

    }


    // ==========================================
    // LEADERSHIP
    // ==========================================

    const leadershipStaff =
        allStaff.filter(
            staff =>
                staff.leadership &&
                staff.leadership.length > 0
        ).length;


    if (totalLeadership) {

        totalLeadership.textContent =
            leadershipStaff;

    }


    // ==========================================
    // VISIBILITY
    // ==========================================

    const visibilityStaff =
        allStaff.filter(
            staff =>
                staff.visibility &&
                staff.visibility.length > 0
        ).length;


    if (totalVisibility) {

        totalVisibility.textContent =
            visibilityStaff;

    }

}


// ==========================================
// RENDER STAFF TABLE
// ==========================================

function renderStaffTable(
    staffList
) {

    if (!staffTableBody) {
        return;
    }


    // ==========================================
    // EMPTY
    // ==========================================

    if (!staffList.length) {

        staffTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Tiada staf dijumpai.
                </td>
            </tr>
        `;

        return;
    }


    staffTableBody.innerHTML = "";


    staffList.forEach(staff => {

        const row =
            document.createElement("tr");


        // ==========================================
        // DEPARTMENT
        // ==========================================

        const department =
            staff.employment?.current_department ||
            staff.employment?.original_department ||
            "-";


        // ==========================================
        // PKA
        // ==========================================

        const pka =
            getPKAProgress(staff);


        // ==========================================
        // PKI
        // ==========================================

        const pki =
            getPKIProgress(staff);


        // ==========================================
        // LEADERSHIP
        // ==========================================

        const leadershipCount =
            (
                staff.leadership || []
            ).length;


        const leadershipText =
            leadershipCount > 0
                ? leadershipCount + " rekod"
                : "-";


        // ==========================================
        // VISIBILITY
        // ==========================================

        const visibilityCount =
            (
                staff.visibility || []
            ).length;


        const visibilityText =
            visibilityCount > 0
                ? visibilityCount + " rekod"
                : "-";


        // ==========================================
        // TABLE ROW
        // ==========================================

        row.innerHTML = `

            <td>
                ${escapeHtml(
                    staff.staff_id || "-"
                )}
            </td>


            <td>
                ${escapeHtml(
                    staff.full_name || "-"
                )}
            </td>


            <td>
                ${escapeHtml(
                    department
                )}
            </td>


            <td>
                ${escapeHtml(
                    pka
                )}
            </td>


            <td>
                ${escapeHtml(
                    pki
                )}
            </td>


            <td>
                ${escapeHtml(
                    leadershipText
                )}
            </td>


            <td>
                ${escapeHtml(
                    visibilityText
                )}
            </td>


            <td>

                <button
                    class="view-staff-btn"
                    data-id="${staff.id}"
                >
                    Lihat
                </button>

            </td>

        `;


        staffTableBody.appendChild(row);

    });


    // ==========================================
    // VIEW BUTTON
    // ==========================================

    document
        .querySelectorAll(
            ".view-staff-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const userId =
                        button.dataset.id;

                    viewStaff(userId);

                }
            );

        });

}


// ==========================================
// SEARCH STAFF
// ==========================================

if (staffSearch) {

    staffSearch.addEventListener(
        "input",
        () => {

            const keyword =
                staffSearch.value
                    .toLowerCase()
                    .trim();


            const filtered =
                allStaff.filter(
                    staff => {

                        const name =
                            (
                                staff.full_name ||
                                ""
                            )
                            .toLowerCase();


                        const staffId =
                            (
                                staff.staff_id ||
                                ""
                            )
                            .toLowerCase();


                        const email =
                            (
                                staff.email ||
                                ""
                            )
                            .toLowerCase();


                        const department =
                            (
                                staff.employment
                                    ?.current_department ||
                                ""
                            )
                            .toLowerCase();


                        return (
                            name.includes(keyword) ||
                            staffId.includes(keyword) ||
                            email.includes(keyword) ||
                            department.includes(keyword)
                        );

                    }
                );


            renderStaffTable(
                filtered
            );

        }
    );

}


// ==========================================
// VIEW STAFF
// ==========================================

function viewStaff(userId) {

    const staff =
        allStaff.find(
            item =>
                item.id === userId
        );


    if (!staff) {

        alert(
            "Data staf tidak dijumpai."
        );

        return;
    }


    const leadership =
        staff.leadership || [];


    const visibility =
        staff.visibility || [];


    const employment =
        staff.employment || {};


    const message = `

Nama:
${staff.full_name || "-"}

Staff ID:
${staff.staff_id || "-"}

Email:
${staff.email || "-"}

Jabatan:
${employment.current_department || "-"}

Jawatan:
${employment.current_position || "-"}

Gred:
${employment.salary_grade || "-"}

PKA:
${getPKAProgress(staff)}

PKI:
${getPKIProgress(staff)}

Sejarah Jawatan:
${leadership.length} rekod

Ketampakan:
${visibility.length} rekod

`;


    alert(message);

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();


                if (error) {
                    throw error;
                }


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Gagal log keluar."
                );

            }

        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
