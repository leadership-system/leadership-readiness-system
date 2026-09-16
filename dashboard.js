// ==========================================
// DASHBOARD.JS
// Leadership Readiness System
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const headerName = document.getElementById("headerName");
const headerStaffId = document.getElementById("headerStaffId");

const welcomeName = document.getElementById("welcomeName");

const profileName = document.getElementById("profileName");
const profileStaffId = document.getElementById("profileStaffId");
const profileTitle = document.getElementById("profileTitle");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");



const positionCount = document.getElementById("positionCount");

const mainPosition = document.getElementById("mainPosition");
const mainDepartment = document.getElementById("mainDepartment");
const salaryGrade = document.getElementById("salaryGrade");

const leadershipCount = document.getElementById("leadershipCount");
const leadershipScore = document.getElementById("leadershipScore");

const visibilityStatus = document.getElementById("visibilityStatus");

const logoutBtn = document.getElementById("logoutBtn");

const message = document.getElementById("message");

const pkaCount = document.getElementById("pkaCount");
const pkaStatus = document.getElementById("pkaStatus");
const pkaPercentage = document.getElementById("pkaPercentage");
const pkaProgress = document.getElementById("pkaProgress");

const pkiCount = document.getElementById("pkiCount");
const pkiStatus = document.getElementById("pkiStatus");
const pkiPercentage = document.getElementById("pkiPercentage");
const pkiProgress = document.getElementById("pkiProgress");


const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");

const dropdownName = document.getElementById("dropdownName");
const dropdownStaffId = document.getElementById("dropdownStaffId");

const dropdownLogoutBtn =
    document.getElementById("dropdownLogoutBtn");


// ==========================================
// POSITION SCORE
// SCORE HANYA BERDASARKAN JAWATAN
// TIDAK DARAB TEMPOH
// ==========================================

const POSITION_SCORE = {

    "timbalan naib canselor": 6,

    "penolong naib canselor": 5,

    "rektor": 4,
    "dekan": 4,
    "pengarah": 4,

    "timbalan rektor": 3,
    "timbalan pengarah": 3,
    "timbalan dekan": 3,
    "penolong rektor": 3,

    "ketua pusat pengajian": 2,

    "koordinator": 1
};


// ==========================================
// START DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    try {

        showMessage("Memuatkan dashboard...", "");

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error("Session error:", error);

            throw error;

        }


        if (!session) {

            window.location.href = "index.html";

            return;

        }


        const userId = session.user.id;


        console.log("================================");
        console.log("DASHBOARD START");
        console.log("Logged in user:", session.user);
        console.log("User ID:", userId);
        console.log("================================");


        // LOAD SEMUA DATA

const [
    profileResult,
    employmentResult,
    trainingResult,
    leadershipResult,
    visibilityResult
] = await Promise.all([

    loadProfile(userId),

    loadEmployment(userId),

    loadTraining(userId),

    loadAcademicLeadership(userId),

    loadAcademicVisibility(userId)

]);


// ==========================================
// CREATE READINESS SPIDER CHART
// ==========================================

createReadinessChart({

    pka: trainingResult?.pkaPercent || 0,

    pki: trainingResult?.pkiPercent || 0,

    leadership:
        leadershipResult?.leadershipPercent || 0,

    leadershipScore:
        leadershipResult?.highestScore || 0,

    academic:
        visibilityResult?.academicPercent || 0,

    research:
        visibilityResult?.researchPercent || 0,

    ican:
        visibilityResult?.icanPercent || 0,

    hep:
        visibilityResult?.hepPercent || 0

});


        showMessage("", "");


        console.log("Dashboard loaded successfully.");


    } catch (error) {

        console.error("Dashboard error:", error);

        showMessage(
            "Terdapat masalah ketika memuatkan dashboard.",
            "error"
        );

    }

});


// ==========================================
// PROFILE
// ==========================================

async function loadProfile(userId) {

    console.log("Loading PROFILE...");


    const {
        data,
        error
    } = await supabaseClient

        .from("profiles")

        .select("*")

        .eq("id", userId)

        .maybeSingle();


    console.log("PROFILE DATA:", data);
    console.log("PROFILE ERROR:", error);


    if (error) {

        console.error("Profile error:", error);

        return;

    }


    if (!data) {

        console.log("No profile found.");

        return;

    }


    const name = getFirstValue(
        data,
        [
            "nama",
            "name",
            "full_name"
        ]
    ) || "-";


    const staffId = getFirstValue(
        data,
        [
            "staff_id",
            "staffid",
            "staffId"
        ]
    ) || "-";


    const title = getFirstValue(
        data,
        [
            "gelaran",
            "title"
        ]
    ) || "-";


    const email = getFirstValue(
        data,
        [
            "emel",
            "email"
        ]
    ) || "-";


    const phone = getFirstValue(
        data,
        [
            "notelefon",
            "no_telefon",
            "phone",
            "phone_number"
        ]
    ) || "-";


    // DISPLAY

    setText(headerName, name);

    setText(headerStaffId, staffId);

    setText(welcomeName, name);

    setText(dropdownName, name);
    
    setText(dropdownStaffId, staffId);

    setText(profileName, name);

    setText(profileStaffId, staffId);

    setText(profileTitle, title);

    setText(profileEmail, email);

    setText(profilePhone, phone);

}


// ==========================================
// EMPLOYMENT
// ==========================================

// ==========================================
// LOAD EMPLOYMENT
// ==========================================

async function loadEmployment(userId) {

    console.log("Memuat Perjawatan...");

    const {
        data,
        error
    } = await supabaseClient
        .from("employment")
        .select("*")
        .eq("user_id", userId)
        .single();

    console.log("EMPLOYMENT DATA:", data);
    console.log("EMPLOYMENT ERROR:", error);

    if (error) {

        console.error("Employment error:", error);

        return;

    }

    if (!data) {

        console.log("Tiada rekod perjawatan.");

        return;

    }


    // ==========================================
    // GET VALUES
    // ==========================================

    const jawatanHakiki =
        data.original_position || "-";

    const jabatanHakiki =
        data.original_department || "-";

    const gred =
        data.salary_grade ||
        data.gred ||
        data.grade ||
        "-";


    // ==========================================
    // DISPLAY
    // ==========================================

    setText(
        mainPosition,
        jawatanHakiki
    );

    setText(
        mainDepartment,
        jabatanHakiki
    );

    setText(
        salaryGrade,
        gred
    );

}

// ==========================================
// TRAINING
// ==========================================

async function loadTraining(userId) {

    console.log("Memuat Latihan...");


    // ==========================================
    // USER TRAINING
    // ==========================================

    const {
        data,
        error
    } = await supabaseClient
        .from("user_training")
        .select("*")
        .eq("user_id", userId);


    console.log("USER TRAINING DATA:", data);
    console.log("USER TRAINING ERROR:", error);


    if (error) {

        console.error("Training error:", error);

        return;

    }


    const records = data || [];


    // ==========================================
    // COURSE ID
    // ==========================================

    const PKA_COURSE_ID =
        "113263ea-93ca-474f-93f8-888090d33db4";

    const PKI_COURSE_ID =
        "b17113c6-75a5-4977-8407-c982c943cb9d";


    // ==========================================
    // GET PKA MODULES
    // ==========================================

    const {
        data: pkaModules,
        error: pkaError
    } = await supabaseClient
        .from("training_modules")
        .select("id, course_id, module_no, module_name")
        .eq("course_id", PKA_COURSE_ID);


    if (pkaError) {

        console.error("PKA module error:", pkaError);

        return;

    }


    // ==========================================
    // GET PKI MODULES
    // ==========================================

    const {
        data: pkiModules,
        error: pkiError
    } = await supabaseClient
        .from("training_modules")
        .select("id, course_id, module_no, module_name")
        .eq("course_id", PKI_COURSE_ID);


    if (pkiError) {

        console.error("PKI module error:", pkiError);

        return;

    }


    console.log("PKA MODULES:", pkaModules);
    console.log("PKI MODULES:", pkiModules);


    // ==========================================
    // MODULE IDs
    // ==========================================

    const pkaModuleIds = pkaModules.map(
        module => module.id
    );

    const pkiModuleIds = pkiModules.map(
        module => module.id
    );


    // ==========================================
    // USER PKA RECORDS
    // ==========================================

    const pkaRecords = records.filter(record =>
        pkaModuleIds.includes(record.module_id)
    );


    // ==========================================
    // USER PKI RECORDS
    // ==========================================

    const pkiRecords = records.filter(record =>
        pkiModuleIds.includes(record.module_id)
    );


    console.log("PKA RECORDS:", pkaRecords);
    console.log("PKI RECORDS:", pkiRecords);


    // ==========================================
    // COUNT COMPLETED
    // ==========================================

    const pkaCompleted = pkaRecords.filter(record =>
        record.attendance === true ||
        record.attendance === "Ya"
    ).length;


    const pkiCompleted = pkiRecords.filter(record =>
        record.attendance === true ||
        record.attendance === "Ya"
    ).length;


    // ==========================================
    // TOTAL MODULES
    // ==========================================

    const pkaTotal = pkaModules.length;
    const pkiTotal = pkiModules.length;


    // ==========================================
    // PERCENTAGE
    // ==========================================

    const pkaPercent = pkaTotal > 0
        ? Math.round((pkaCompleted / pkaTotal) * 100)
        : 0;


    const pkiPercent = pkiTotal > 0
        ? Math.round((pkiCompleted / pkiTotal) * 100)
        : 0;


    // ==========================================
    // DISPLAY PKA
    // ==========================================

    setText(
        pkaCount,
        `${pkaCompleted} / ${pkaTotal}`
    );


    setText(
        pkaStatus,
        `${pkaCompleted} modul selesai`
    );


    setText(
        pkaPercentage,
        `${pkaPercent}%`
    );


    if (pkaProgress) {

        pkaProgress.style.width =
            `${pkaPercent}%`;

    }


    // ==========================================
    // DISPLAY PKI
    // ==========================================

    setText(
        pkiCount,
        `${pkiCompleted} / ${pkiTotal}`
    );


    setText(
        pkiStatus,
        `${pkiCompleted} modul selesai`
    );


    setText(
        pkiPercentage,
        `${pkiPercent}%`
    );


    if (pkiProgress) {

        pkiProgress.style.width =
            `${pkiPercent}%`;

    }


    console.log(
        `PKA: ${pkaCompleted}/${pkaTotal} (${pkaPercent}%)`
    );


    console.log(
        `PKI: ${pkiCompleted}/${pkiTotal} (${pkiPercent}%)`
    );

    return {
    pkaPercent,
    pkiPercent
};

}

// ==========================================
// ATTENDANCE
// ==========================================

function isAttendanceYes(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return false;

    }


    const attendance =
        String(value)
            .trim()
            .toLowerCase();


    return (

        attendance === "ya" ||

        attendance === "yes" ||

        attendance === "true" ||

        attendance === "1"

    );

}


// ==========================================
// ACADEMIC LEADERSHIP
// ==========================================

async function loadAcademicLeadership(userId) {

    console.log(
        "Loading ACADEMIC LEADERSHIP..."
    );


    const {
        data,
        error
    } = await supabaseClient

        .from("academic_leadership_history")

        .select("*")

        .eq("user_id", userId)

        .order(
            "start_date",
            {
                ascending: true
            }
        );


    console.log(
        "ACADEMIC LEADERSHIP DATA:",
        data
    );

    console.log(
        "ACADEMIC LEADERSHIP ERROR:",
        error
    );


    if (error) {

        console.error(
            "Academic leadership error:",
            error
        );

        return;

    }


    const records = data || [];


    // TOTAL RECORD

    setText(
        leadershipCount,
        records.length
    );


    setText(
        positionCount,
        records.length
    );


    // ======================================
    // CALCULATE SCORE
    // ======================================

let totalScore = 0;
let highestScore = 0;

records.forEach(record => {

    const position =
        getFirstValue(
            record,
            [
                "position_name",
                "position",
                "jawatan"
            ]
        );

    const score =
        getPositionScore(position);

    console.log(
        "Position:",
        position,
        "Score:",
        score
    );

    // Jumlah semua skor untuk paparan dashboard
    totalScore += score;

    // Skor tertinggi untuk spider chart
    if (score > highestScore) {
        highestScore = score;
    }

});


    setText(
        leadershipScore,
        formatNumber(totalScore)
    );

    const leadershipPercent =
    highestScore > 0
        ? Math.round((highestScore / 6) * 100)
        : 0;

return {
    highestScore,
    leadershipPercent
};

}


// ==========================================
// GET POSITION SCORE
// ==========================================

function getPositionScore(position) {

    if (!position) {

        return 0;

    }


    const cleanPosition =
        String(position)
            .trim()
            .toLowerCase();


    if (
        Object.prototype.hasOwnProperty.call(
            POSITION_SCORE,
            cleanPosition
        )
    ) {

        return POSITION_SCORE[
            cleanPosition
        ];

    }


    if (
        cleanPosition.includes(
            "timbalan naib canselor"
        )
    ) {

        return 6;

    }


    if (
        cleanPosition.includes(
            "penolong naib canselor"
        )
    ) {

        return 5;

    }


    if (
        cleanPosition.includes("timbalan rektor")
    ) {

        return 3;

    }


    if (
        cleanPosition.includes("timbalan pengarah")
    ) {

        return 3;

    }


    if (
        cleanPosition.includes("timbalan dekan")
    ) {

        return 3;

    }


    if (
        cleanPosition.includes("penolong rektor")
    ) {

        return 3;

    }


    if (
        cleanPosition.includes("rektor")
    ) {

        return 4;

    }


    if (
        cleanPosition.includes("dekan")
    ) {

        return 4;

    }


    if (
        cleanPosition.includes("pengarah")
    ) {

        return 4;

    }


    if (
        cleanPosition.includes(
            "ketua pusat pengajian"
        )
    ) {

        return 2;

    }


    if (
        cleanPosition.includes(
            "koordinator"
        )
    ) {

        return 1;

    }


    return 0;

}


// ==========================================
// ACADEMIC VISIBILITY
// ==========================================

async function loadAcademicVisibility(userId) {

    console.log(
        "Loading ACADEMIC VISIBILITY..."
    );


    const {
        data,
        error
    } = await supabaseClient

        .from("academic_visibility")

        .select("*")

        .eq("user_id", userId);


    console.log(
        "ACADEMIC VISIBILITY DATA:",
        data
    );

    console.log(
        "ACADEMIC VISIBILITY ERROR:",
        error
    );


    if (error) {

        console.error(
            "Academic visibility error:",
            error
        );

        return;

    }


    const records = data || [];


    if (records.length === 0) {

        setText(
            visibilityStatus,
            "Belum diisi"
        );

        return {
            academicPercent: 0,
            researchPercent: 0,
            icanPercent: 0,
            hepPercent: 0
        };


    }


    setText(
        visibilityStatus,
        `${records.length} rekod`
    );

    // ==========================================
// COUNT BY CATEGORY
// ==========================================

const academicCount =
    records.filter(record =>
        record.category === "Akademik"
    ).length;


const researchCount =
    records.filter(record =>
        record.category === "Penyelidikan"
    ).length;


const icanCount =
    records.filter(record =>
        record.category === "ICAN"
    ).length;


const hepCount =
    records.filter(record =>
        record.category === "Hal Ehwal Pelajar"
    ).length;


// ==========================================
// NORMALISE TO 100%
// ==========================================

const academicPercent =
    Math.round(
        Math.min(academicCount, 12) / 12 * 100
    );


const researchPercent =
    Math.round(
        Math.min(researchCount, 8) / 8 * 100
    );


const icanPercent =
    Math.round(
        Math.min(icanCount, 3) / 3 * 100
    );


const hepPercent =
    Math.round(
        Math.min(hepCount, 2) / 2 * 100
    );


console.log(
    "Visibility:",
    {
        academicCount,
        researchCount,
        icanCount,
        hepCount
    }
);


console.log(
    "Visibility percentage:",
    {
        academicPercent,
        researchPercent,
        icanPercent,
        hepPercent
    }
);


return {
    academicPercent,
    researchPercent,
    icanPercent,
    hepPercent
};

}


// ==========================================
// HELPER
// ==========================================

function getFirstValue(object, keys) {

    if (!object) {

        return null;

    }


    for (const key of keys) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            return object[key];

        }

    }


    return null;

}


// ==========================================
// SET TEXT
// ==========================================

function setText(element, value) {

    if (!element) {

        return;

    }


    element.textContent =
        value ?? "-";

}


// ==========================================
// PERCENTAGE
// ==========================================

function calculatePercentage(
    completed,
    total
) {

    if (
        !total ||
        total <= 0
    ) {

        return 0;

    }


    return Math.round(
        (completed / total) * 100
    );

}


// ==========================================
// FORMAT NUMBER
// ==========================================

function formatNumber(number) {

    const value =
        Number(number) || 0;


    return Number.isInteger(value)

        ? value.toString()

        : value.toFixed(2);

}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    text,
    type = ""
) {

    if (!message) {

        return;

    }


    message.textContent =
        text;


    message.className =
        "message";


    if (type) {

        message.classList.add(type);

    }

}

// ==========================================
// LOGOUT MELALUI PROFILE DROPDOWN
// ==========================================

if (dropdownLogoutBtn) {

    dropdownLogoutBtn.addEventListener("click", async (event) => {

        // Elakkan dropdown daripada tertutup dahulu
        event.preventDefault();
        event.stopPropagation();

        try {

            console.log("Logging out...");

            const { error } =
                await supabaseClient.auth.signOut();

            if (error) {

                console.error("Logout error:", error);

                showMessage(
                    "Gagal log keluar. Sila cuba lagi.",
                    "error"
                );

                return;
            }

            console.log("Logout successful.");

            // Redirect ke login page
            window.location.href = "index.html";

        } catch (error) {

            console.error("Logout error:", error);

            showMessage(
                "Gagal log keluar. Sila cuba lagi.",
                "error"
            );

        }

    });

}

// ==========================================
// PROFILE DROPDOWN
// ==========================================

profileBtn?.addEventListener("click", (event) => {
    event.stopPropagation();

    profileDropdown?.classList.toggle("show");
});

document.addEventListener("click", () => {
    profileDropdown?.classList.remove("show");
});


// ==========================================
// READINESS SPIDER CHART
// ==========================================

let readinessChart = null;


function createReadinessChart(data) {

    const canvas =
        document.getElementById("readinessChart");

            // ==========================================
    // DISPLAY READINESS VALUES
    // ==========================================

    setText(
        document.getElementById("readinessPka"),
        `${data.pka}%`
    );

    setText(
        document.getElementById("readinessPki"),
        `${data.pki}%`
    );

    setText(
        document.getElementById("readinessLeadership"),
        `${data.leadershipScore}/6`
    );

    setText(
        document.getElementById("readinessAcademic"),
        `${data.academic}%`
    );

    setText(
        document.getElementById("readinessResearch"),
        `${data.research}%`
    );

    setText(
        document.getElementById("readinessIcan"),
        `${data.ican}%`
    );

    setText(
        document.getElementById("readinessHep"),
        `${data.hep}%`
    );

    if (!canvas) {

        console.error(
            "Canvas readinessChart tidak dijumpai."
        );

        return;

    }


    const ctx =
        canvas.getContext("2d");


    // Hapus chart lama jika ada
    if (readinessChart) {

        readinessChart.destroy();

    }


    readinessChart =
        new Chart(ctx, {

            type: "radar",

            data: {

                labels: [

                    "PKA",

                    "PKI",

                    "Sejarah Jawatan",

                    "Ketampakan Akademik",

                    "Ketampakan Penyelidikan",

                    "Ketampakan ICAN",

                    "Ketampakan HEP"

                ],

                datasets: [

                    {

                        label:
                            "Leadership Readiness",

                        data: [

                            data.pka,

                            data.pki,

                            data.leadership,

                            data.academic,

                            data.research,

                            data.ican,

                            data.hep

                        ],

                        borderWidth: 2,

                        pointRadius: 4,

                        fill: true

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    r: {

                        min: 0,

                        max: 100,

                        beginAtZero: true,

                        ticks: {

                            stepSize: 20

                        },

                        pointLabels: {

                            font: {

                                size: 12,

                                family: "Poppins"

                            }

                        }

                    }

                },

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

}