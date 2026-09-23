
// ==========================================
// DASHBOARD.JS
// Leadership Readiness System
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const headerName =
    document.getElementById("headerName");

const headerStaffId =
    document.getElementById("headerStaffId");

const welcomeName =
    document.getElementById("welcomeName");

const profileName =
    document.getElementById("profileName");

const profileStaffId =
    document.getElementById("profileStaffId");

const profileTitle =
    document.getElementById("profileTitle");

const profileEmail =
    document.getElementById("profileEmail");

const profilePhone =
    document.getElementById("profilePhone");

const mainPosition =
    document.getElementById("mainPosition");

const mainDepartment =
    document.getElementById("mainDepartment");

const salaryGrade =
    document.getElementById("salaryGrade");

const logoutBtn =
    document.getElementById("logoutBtn");

const message =
    document.getElementById("message");

const pkaCount =
    document.getElementById("pkaCount");

const pkaStatus =
    document.getElementById("pkaStatus");

const pkaPercentage =
    document.getElementById("pkaPercentage");

const pkaProgress =
    document.getElementById("pkaProgress");

const pkiCount =
    document.getElementById("pkiCount");

const pkiStatus =
    document.getElementById("pkiStatus");

const pkiPercentage =
    document.getElementById("pkiPercentage");

const pkiProgress =
    document.getElementById("pkiProgress");

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


// ==========================================
// COURSE ID
// ==========================================

const PKA_COURSE_ID =
    "113263ea-93ca-474f-93f8-888090d33db4";

const PKI_COURSE_ID =
    "b17113c6-75a5-4977-8407-c982c943cb9d";


// ==========================================
// CHART VARIABLES
// ==========================================

let readinessChart = null;

let lnptGaugeChart = null;


// ==========================================
// START DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            showMessage(
                "Memuatkan dashboard...",
                ""
            );


            // ==========================================
            // CHECK SESSION
            // ==========================================

            const {
                data: {
                    session
                },
                error
            } =
                await supabaseClient.auth.getSession();


            if (error) {

                console.error(
                    "Session error:",
                    error
                );

                throw error;

            }


            if (!session) {

                window.location.href =
                    "index.html";

                return;

            }


            const userId =
                session.user.id;


            console.log(
                "================================"
            );

            console.log(
                "DASHBOARD START"
            );

            console.log(
                "User ID:",
                userId
            );

            console.log(
                "================================"
            );


            // ==========================================
            // LOAD SEMUA DATA
            // ==========================================

            const [

                profileResult,

                employmentResult,

                trainingResult,

                leadershipResult,

                lnptResult

            ] =
                await Promise.all([

                    loadProfile(userId),

                    loadEmployment(userId),

                    loadTraining(userId),

                    loadAcademicLeadership(userId),

                    loadLNPT(userId)

                ]);


            // ==========================================
            // KIRA SKOR GRED GAJI
            // ==========================================

            const grade =
                employmentResult?.salary_grade ||
                employmentResult?.gred ||
                employmentResult?.grade ||
                "";


            const salaryGradeScore =
                getSalaryGradeScore(
                    grade
                );


            // ==========================================
            // KIRA PRESTASI
            // ==========================================
            //
            // Prestasi =
            // (Skor Gred Gaji + Purata LNPT) / 2
            //
            // Gred Gaji:
            // DS11 = 16.67
            // DS13 = 33.33
            // DS14 = 50
            // VK7  = 66.67
            // VK6  = 83.33
            // VK5  = 100
            //
            // LNPT = purata markah 3 tahun terkini
            //
            // ==========================================

            const lnptAverage =
                Number(
                    lnptResult?.average
                ) || 0;


            const performancePercent =
                (
                    salaryGradeScore +
                    lnptAverage
                ) / 2;


            const roundedPerformance =
                Math.round(
                    performancePercent * 100
                ) / 100;


            // ==========================================
            // CREATE READINESS CHART
            // ==========================================

            createReadinessChart({

                performance:
                    roundedPerformance,

                pka:
                    trainingResult?.pkaPercent || 0,

                pki:
                    trainingResult?.pkiPercent || 0,

                leadership:
                    leadershipResult?.leadershipPercent || 0

            });


            // ==========================================
            // HIDE LOADING MESSAGE
            // ==========================================

            showMessage(
                "",
                ""
            );


            console.log(
                "================================"
            );

            console.log(
                "DASHBOARD LOADED"
            );

            console.log(
                "Salary Grade Score:",
                salaryGradeScore
            );

            console.log(
                "LNPT Average:",
                lnptAverage
            );

            console.log(
                "Performance:",
                roundedPerformance
            );

            console.log(
                "PKA:",
                trainingResult?.pkaPercent || 0
            );

            console.log(
                "PKI:",
                trainingResult?.pkiPercent || 0
            );

            console.log(
                "Leadership:",
                leadershipResult?.leadershipPercent || 0
            );

            console.log(
                "================================"
            );


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );


            showMessage(
                "Terdapat masalah ketika memuatkan dashboard.",
                "error"
            );

        }

    }
);


// ==========================================
// PROFILE
// ==========================================

async function loadProfile(userId) {

    console.log(
        "Loading PROFILE..."
    );


    const {
        data,
        error
    } =
        await supabaseClient

            .from("profiles")

            .select("*")

            .eq(
                "id",
                userId
            )

            .maybeSingle();


    console.log(
        "PROFILE DATA:",
        data
    );

    console.log(
        "PROFILE ERROR:",
        error
    );


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return null;

    }


    if (!data) {

        console.log(
            "No profile found."
        );

        return null;

    }


    // ==========================================
    // GET PROFILE VALUES
    // ==========================================

    const name =
        getFirstValue(
            data,
            [
                "nama",
                "name",
                "full_name"
            ]
        ) || "-";


    const staffId =
        getFirstValue(
            data,
            [
                "staff_id",
                "staffid",
                "staffId"
            ]
        ) || "-";


    const title =
        getFirstValue(
            data,
            [
                "gelaran",
                "title"
            ]
        ) || "-";


    const email =
        getFirstValue(
            data,
            [
                "emel",
                "email"
            ]
        ) || "-";


    const phone =
        getFirstValue(
            data,
            [
                "notelefon",
                "no_telefon",
                "phone",
                "phone_number"
            ]
        ) || "-";


    // ==========================================
    // DISPLAY PROFILE
    // ==========================================

    setText(
        headerName,
        name
    );

    setText(
        headerStaffId,
        staffId
    );

    setText(
        welcomeName,
        name
    );

    setText(
        dropdownName,
        name
    );

    setText(
        dropdownStaffId,
        staffId
    );

    setText(
        profileName,
        name
    );

    setText(
        profileStaffId,
        staffId
    );

    setText(
        profileTitle,
        title
    );

    setText(
        profileEmail,
        email
    );

    setText(
        profilePhone,
        phone
    );


    return data;

}


// ==========================================
// EMPLOYMENT
// ==========================================

async function loadEmployment(userId) {

    console.log(
        "Memuat Perjawatan..."
    );


    const {
        data,
        error
    } =
        await supabaseClient

            .from("employment")

            .select("*")

            .eq(
                "user_id",
                userId
            )

            .maybeSingle();


    console.log(
        "EMPLOYMENT DATA:",
        data
    );

    console.log(
        "EMPLOYMENT ERROR:",
        error
    );


    if (error) {

        console.error(
            "Employment error:",
            error
        );

        return null;

    }


    // ==========================================
    // TIADA REKOD
    // ==========================================

    if (!data) {

        console.log(
            "Tiada rekod perjawatan."
        );


        setText(
            mainPosition,
            "-"
        );

        setText(
            mainDepartment,
            "-"
        );

        setText(
            salaryGrade,
            "-"
        );


        return null;

    }


    // ==========================================
    // GET VALUES
    // ==========================================

    const jawatanHakiki =
        data.original_position ||
        "-";


    const jabatanHakiki =
        data.original_department ||
        "-";


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


    return data;

}


// ==========================================
// TRAINING
// ==========================================

async function loadTraining(userId) {

    console.log(
        "Memuat Latihan..."
    );


    // ==========================================
    // USER TRAINING
    // ==========================================

    const {
        data,
        error
    } =
        await supabaseClient

            .from("user_training")

            .select("*")

            .eq(
                "user_id",
                userId
            );


    console.log(
        "USER TRAINING DATA:",
        data
    );

    console.log(
        "USER TRAINING ERROR:",
        error
    );


    if (error) {

        console.error(
            "Training error:",
            error
        );


        return {

            pkaPercent: 0,

            pkiPercent: 0

        };

    }


    const records =
        data || [];


    // ==========================================
    // LOAD PKA MODULES
    // ==========================================

    const {
        data: pkaModules,
        error: pkaError
    } =
        await supabaseClient

            .from("training_modules")

            .select(
                "id, course_id, module_no, module_name"
            )

            .eq(
                "course_id",
                PKA_COURSE_ID
            );


    if (pkaError) {

        console.error(
            "PKA module error:",
            pkaError
        );

    }


    // ==========================================
    // LOAD PKI MODULES
    // ==========================================

    const {
        data: pkiModules,
        error: pkiError
    } =
        await supabaseClient

            .from("training_modules")

            .select(
                "id, course_id, module_no, module_name"
            )

            .eq(
                "course_id",
                PKI_COURSE_ID
            );


    if (pkiError) {

        console.error(
            "PKI module error:",
            pkiError
        );

    }


    const pkaModuleList =
        pkaModules || [];


    const pkiModuleList =
        pkiModules || [];


    // ==========================================
    // MODULE IDS
    // ==========================================

    const pkaModuleIds =
        pkaModuleList.map(
            module =>
                module.id
        );


    const pkiModuleIds =
        pkiModuleList.map(
            module =>
                module.id
        );


    // ==========================================
    // USER PKA RECORDS
    // ==========================================

    const pkaRecords =
        records.filter(
            record =>
                pkaModuleIds.includes(
                    record.module_id
                )
        );


    // ==========================================
    // USER PKI RECORDS
    // ==========================================

    const pkiRecords =
        records.filter(
            record =>
                pkiModuleIds.includes(
                    record.module_id
                )
        );


    // ==========================================
    // COUNT COMPLETED
    // ==========================================

    const pkaCompleted =
        pkaRecords.filter(
            record =>
                isAttendanceYes(
                    record.attendance
                )
        ).length;


    const pkiCompleted =
        pkiRecords.filter(
            record =>
                isAttendanceYes(
                    record.attendance
                )
        ).length;


    // ==========================================
    // TOTAL MODULES
    // ==========================================

    const pkaTotal =
        pkaModuleList.length;


    const pkiTotal =
        pkiModuleList.length;


    // ==========================================
    // PERCENTAGE
    // ==========================================

    const pkaPercent =
        calculatePercentage(
            pkaCompleted,
            pkaTotal
        );


    const pkiPercent =
        calculatePercentage(
            pkiCompleted,
            pkiTotal
        );


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
// LNPT
// ==========================================

async function loadLNPT(userId) {

    console.log(
        "Loading LNPT..."
    );


    const {
        data,
        error
    } =
        await supabaseClient

            .from("lnpt_history")

            .select(
                "lnpt_year, markah"
            )

            .eq(
                "user_id",
                userId
            );


    console.log(
        "LNPT DATA:",
        data
    );

    console.log(
        "LNPT ERROR:",
        error
    );


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        console.error(
            "LNPT error:",
            error
        );


        displayLNPT(
            0,
            []
        );


        createLNPTGauge(
            0,
            []
        );


        return {

            average: 0,

            records: []

        };

    }


    // ==========================================
    // RECORDS
    // ==========================================

    const records =
        data || [];


    // ==========================================
    // SUSUN TAHUN TERKINI
    // ==========================================

    records.sort(
        (a, b) =>
            Number(b.lnpt_year) -
            Number(a.lnpt_year)
    );


    // ==========================================
    // AMBIL 3 TAHUN TERKINI
    // ==========================================

    const latestThree =
        records.slice(
            0,
            3
        );


    // ==========================================
    // FILTER MARKAH SAH
    // ==========================================

    const validRecords =
        latestThree.filter(
            record =>
                Number.isFinite(
                    Number(record.markah)
                )
        );


    // ==========================================
    // KIRA PURATA
    // ==========================================

    let average = 0;


    if (
        validRecords.length > 0
    ) {

        const total =
            validRecords.reduce(
                (sum, record) =>
                    sum +
                    Number(
                        record.markah
                    ),
                0
            );


        average =
            total /
            validRecords.length;

    }


    // ==========================================
    // ROUND 2 DECIMAL
    // ==========================================

    average =
        Math.round(
            average * 100
        ) / 100;


    // ==========================================
    // DISPLAY
    // ==========================================

    displayLNPT(
        average,
        latestThree
    );


    createLNPTGauge(
        average,
        latestThree
    );


    console.log(
        "3 LNPT TERKINI:",
        latestThree
    );


    console.log(
        "PURATA LNPT:",
        average
    );


    return {

        average,

        records:
            latestThree

    };

}


// ==========================================
// DISPLAY LNPT
// ==========================================

function displayLNPT(
    average,
    records
) {

    const lnptGrade =
        document.getElementById(
            "lnptGrade"
        );


    if (lnptGrade) {

        if (
            records &&
            records.length > 0
        ) {

            lnptGrade.textContent =
                getLNPTGrade(
                    average
                );

        } else {

            lnptGrade.textContent =
                "Tiada rekod LNPT";

        }

    }


    // ==========================================
    // OPTIONAL OLD SCORE
    // ==========================================

    const lnptScore =
        document.getElementById(
            "lnptScore"
        );


    if (lnptScore) {

        lnptScore.textContent =
            formatNumber(
                average
            );

    }


    // ==========================================
    // OPTIONAL OLD YEARS
    // ==========================================

    const lnptYears =
        document.getElementById(
            "lnptYears"
        );


    if (lnptYears) {

        if (
            records &&
            records.length > 0
        ) {

            const years =
                records.map(
                    record =>
                        record.lnpt_year
                );


            lnptYears.textContent =
                `Purata ${years.join(", ")}`;

        } else {

            lnptYears.textContent =
                "Tiada rekod LNPT";

        }

    }

}


// ==========================================
// LNPT GAUGE
// ==========================================

function createLNPTGauge(
    markah,
    records = []
) {

    const canvas =
        document.getElementById(
            "lnptGauge"
        );


    if (!canvas) {

        console.warn(
            "Canvas lnptGauge tidak dijumpai."
        );

        return;

    }


    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js tidak dimuatkan."
        );

        return;

    }


    const score =
        Number(markah);


    const hasRecord =
        records &&
        records.length > 0 &&
        Number.isFinite(score);


    const value =
        hasRecord

            ? Math.min(
                Math.max(
                    score,
                    0
                ),
                100
            )

            : 0;


    // ==========================================
    // SCORE DISPLAY
    // ==========================================

    const scoreElement =
        document.getElementById(
            "lnptGaugeScore"
        );


    if (scoreElement) {

        scoreElement.textContent =
            hasRecord

                ? score.toFixed(2)

                : "0.00";

    }


    // ==========================================
    // GRADE DISPLAY
    // ==========================================

    const gradeElement =
        document.getElementById(
            "lnptGaugeGrade"
        );


    if (gradeElement) {

        gradeElement.textContent =
            hasRecord

                ? getLNPTGrade(
                    score
                )

                : "Tiada rekod LNPT";

    }


    // ==========================================
    // YEARS DISPLAY
    // ==========================================

    const yearsElement =
        document.getElementById(
            "lnptGaugeYears"
        );


    if (yearsElement) {

        if (hasRecord) {

            const years =
                records

                    .map(
                        record =>
                            record.lnpt_year
                    )

                    .filter(
                        year =>
                            year !== null &&
                            year !== undefined &&
                            year !== ""
                    )

                    .sort(
                        (a, b) =>
                            Number(a) -
                            Number(b)
                    );


            yearsElement.textContent =
                years.join(", ");

        } else {

            yearsElement.textContent =
                "-";

        }

    }


    // ==========================================
    // DESTROY CHART LAMA
    // ==========================================

    if (lnptGaugeChart) {

        lnptGaugeChart.destroy();

        lnptGaugeChart = null;

    }


    // ==========================================
    // CREATE GAUGE
    // ==========================================

    const ctx =
        canvas.getContext(
            "2d"
        );


    lnptGaugeChart =
        new Chart(
            ctx,
            {

                type:
                    "doughnut",


                data: {

                    datasets: [

                        {

                            data: [

                                value,

                                100 - value

                            ],


                            backgroundColor: [

                                "#2563eb",

                                "#e5e7eb"

                            ],


                            borderWidth:
                                0,


                            circumference:
                                180,


                            rotation:
                                270,


                            cutout:
                                "76%"

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                false

                        },


                        tooltip: {

                            enabled:
                                false

                        }

                    },


                    animation: {

                        duration:
                            800

                    }

                }

            }
        );

}


// ==========================================
// GET LNPT GRADE
// ==========================================

function getLNPTGrade(
    markah
) {

    const score =
        Number(markah);


    if (
        !Number.isFinite(score)
    ) {

        return "Tiada rekod LNPT";

    }


    if (
        score >= 90 &&
        score <= 100
    ) {

        return "Cemerlang";

    }


    if (
        score >= 80 &&
        score < 90
    ) {

        return "Baik";

    }


    if (
        score >= 60 &&
        score < 80
    ) {

        return "Sederhana";

    }


    if (
        score >= 50 &&
        score < 60
    ) {

        return "Kurang Memuaskan";

    }


    if (
        score >= 0 &&
        score < 50
    ) {

        return "Lemah";

    }


    return "Tiada rekod LNPT";

}


// ==========================================
// SALARY GRADE SCORE
// ==========================================

function getSalaryGradeScore(
    grade
) {

    if (!grade) {

        return 0;

    }


    const normalizedGrade =
        String(grade)
            .trim()
            .toUpperCase();


    const gradeScores = {

        "DS11": 16.67,

        "DS13": 33.33,

        "DS14": 50,

        "VK7": 66.67,

        "VK6": 83.33,

        "VK5": 100

    };


    return (
        gradeScores[
            normalizedGrade
        ] || 0
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
    } =
        await supabaseClient

            .from("academic_leadership_history")

            .select("*")

            .eq(
                "user_id",
                userId
            )

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


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        console.error(
            "Academic leadership error:",
            error
        );


        renderLeadershipHistory(
            []
        );


        return {

            highestScore: 0,

            leadershipPercent: 0

        };

    }


    const records =
        data || [];


    // ==========================================
    // DISPLAY HISTORY
    // ==========================================

    renderLeadershipHistory(
        records
    );


    // ==========================================
    // TIADA REKOD
    // ==========================================

    if (
        records.length === 0
    ) {

        return {

            highestScore: 0,

            leadershipPercent: 0

        };

    }


    // ==========================================
    // KIRA SKOR SETIAP JAWATAN
    // ==========================================

    const scoredRecords =
        records.map(
            record => {

                const position =
                    getFirstValue(
                        record,
                        [
                            "position_name",
                            "position",
                            "jawatan"
                        ]
                    ) || "";


                const roleScore =
                    getLeadershipPositionScore(
                        position
                    );


                const duration =
                    calculateSingleDuration(
                        record.start_date,
                        record.end_date
                    );


                const totalMonths =
                    (
                        duration.years * 12
                    ) +
                    duration.months +
                    (
                        duration.days / 30
                    );


                const tenureScore =
                    getTenureScore(
                        totalMonths
                    );


                return {

                    record,

                    position,

                    roleScore,

                    duration,

                    totalMonths,

                    tenureScore

                };

            }
        );


    // ==========================================
    // SUSUN JAWATAN BERDASARKAN SKOR
    // ==========================================

    scoredRecords.sort(
        (a, b) => {

            if (
                b.roleScore !==
                a.roleScore
            ) {

                return (
                    b.roleScore -
                    a.roleScore
                );

            }


            return (
                b.totalMonths -
                a.totalMonths
            );

        }
    );


    const highestPosition =
        scoredRecords[0];


    // ==========================================
    // NORMALISE SKOR JAWATAN
    // ==========================================

    const positionPercent =
        (
            highestPosition.roleScore /
            7
        ) * 100;


    // ==========================================
    // SKOR TEMPOH
    // ==========================================

    const tenurePercent =
        highestPosition.tenureScore;


    // ==========================================
    // SEJARAH JAWATAN
    // ==========================================

    const leadershipPercent =
        (
            positionPercent +
            tenurePercent
        ) / 2;


    const roundedLeadershipPercent =
        Math.round(
            leadershipPercent * 100
        ) / 100;


    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
        "JAWATAN TERTINGGI:",
        highestPosition.position
    );

    console.log(
        "SKOR JAWATAN:",
        highestPosition.roleScore
    );

    console.log(
        "SKOR JAWATAN (%):",
        positionPercent
    );

    console.log(
        "TEMPOH:",
        highestPosition.duration
    );

    console.log(
        "SKOR TEMPOH:",
        tenurePercent
    );

    console.log(
        "SEJARAH JAWATAN (%):",
        roundedLeadershipPercent
    );


    return {

        highestScore:
            highestPosition.roleScore,

        leadershipPercent:
            roundedLeadershipPercent

    };

}


// ==========================================
// LEADERSHIP POSITION SCORE
// ==========================================

function getLeadershipPositionScore(
    position
) {

    if (!position) {

        return 0;

    }


    const value =
        String(position)
            .trim()
            .toLowerCase();


    // ==========================================
    // 7 - TIMBALAN NAIB CANSELOR
    // ==========================================

    if (
        value.includes(
            "timbalan naib canselor"
        )
    ) {

        return 7;

    }


    // ==========================================
    // 6 - PENOLONG NAIB CANSELOR
    // ==========================================

    if (
        value.includes(
            "penolong naib canselor"
        )
    ) {

        return 6;

    }


    // ==========================================
    // 5 - REKTOR
    // ==========================================

    if (
        value.includes("rektor") &&
        !value.includes("timbalan") &&
        !value.includes("penolong")
    ) {

        return 5;

    }


    // ==========================================
    // 5 - DEKAN
    // ==========================================

    if (
        value.includes("dekan") &&
        !value.includes("timbalan")
    ) {

        return 5;

    }


    // ==========================================
    // 5 - PENGARAH
    // ==========================================

    if (
        value.includes("pengarah") &&
        !value.includes("timbalan")
    ) {

        return 5;

    }


    // ==========================================
    // 4 - TIMBALAN REKTOR
    // ==========================================

    if (
        value.includes(
            "timbalan rektor"
        )
    ) {

        return 4;

    }


    // ==========================================
    // 4 - TIMBALAN DEKAN
    // ==========================================

    if (
        value.includes(
            "timbalan dekan"
        )
    ) {

        return 4;

    }


    // ==========================================
    // 4 - TIMBALAN PENGARAH
    // ==========================================

    if (
        value.includes(
            "timbalan pengarah"
        )
    ) {

        return 4;

    }


    // ==========================================
    // 3 - PENOLONG REKTOR
    // ==========================================

    if (
        value.includes(
            "penolong rektor"
        )
    ) {

        return 3;

    }


    // ==========================================
    // 2 - KETUA PUSAT PENGAJIAN
    // ==========================================

    if (
        value.includes(
            "ketua pusat pengajian"
        )
    ) {

        return 2;

    }


    // ==========================================
    // 1 - KOORDINATOR
    // ==========================================

    if (
        value.includes(
            "koordinator"
        )
    ) {

        return 1;

    }


    // ==========================================
    // TIADA PADANAN
    // ==========================================

    return 0;

}


// ==========================================
// TENURE SCORE
// ==========================================

function getTenureScore(
    totalMonths
) {

    const months =
        Number(totalMonths) || 0;


    // ==========================================
    // < 2 TAHUN
    // ==========================================

    if (
        months < 24
    ) {

        return 25;

    }


    // ==========================================
    // 2 - < 4 TAHUN
    // ==========================================

    if (
        months < 48
    ) {

        return 50;

    }


    // ==========================================
    // 4 - < 6 TAHUN
    // ==========================================

    if (
        months < 72
    ) {

        return 75;

    }


    // ==========================================
    // >= 6 TAHUN
    // ==========================================

    return 100;

}


// ==========================================
// RENDER LEADERSHIP HISTORY
// ==========================================

function renderLeadershipHistory(
    records
) {

    const leadershipList =
        document.getElementById(
            "leadershipHistoryList"
        );


    if (!leadershipList) {

        return;

    }


    leadershipList.innerHTML =
        "";


    // ==========================================
    // EMPTY
    // ==========================================

    if (
        !records ||
        records.length === 0
    ) {

        leadershipList.innerHTML = `

            <div class="empty-history">

                Tiada rekod jawatan

            </div>

        `;

        return;

    }


    // ==========================================
    // TABLE
    // ==========================================

    let html = `

        <div class="leadership-table-wrapper">

            <table class="leadership-history-table">

                <thead>

                    <tr>

                        <th>Bil.</th>

                        <th>Jenis Jawatan</th>

                        <th>Tarikh Mula</th>

                        <th>Tarikh Tamat</th>

                        <th>Tempoh</th>

                    </tr>

                </thead>

                <tbody>

    `;


    // ==========================================
    // RECORDS
    // ==========================================

    records.forEach(
        (record, index) => {

            const position =
                getFirstValue(
                    record,
                    [
                        "position_name",
                        "position",
                        "jawatan"
                    ]
                ) || "-";


            const start =
                record.start_date
                    ? formatDate(
                        record.start_date
                    )
                    : "-";


            const end =
                record.end_date
                    ? formatDate(
                        record.end_date
                    )
                    : "Kini";


            // ==========================================
            // KIRA TEMPOH
            // ==========================================

            const duration =
                calculateSingleDuration(
                    record.start_date,
                    record.end_date
                );


            const durationText =
                formatDuration(
                    duration.years,
                    duration.months,
                    duration.days
                );


            // ==========================================
            // DISPLAY
            // ==========================================

            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td class="position-cell">

                        ${escapeHTML(
                            position
                        )}

                    </td>

                    <td>

                        ${start}

                    </td>

                    <td>

                        ${end}

                    </td>

                    <td class="duration-cell">

                        ${durationText}

                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    leadershipList.innerHTML =
        html;

}


// ==========================================
// CALCULATE SINGLE DURATION
// ==========================================

function calculateSingleDuration(
    startDate,
    endDate
) {

    if (!startDate) {

        return {

            years: 0,

            months: 0,

            days: 0

        };

    }


    const start =
        new Date(startDate);


    const end =
        endDate
            ? new Date(endDate)
            : new Date();


    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        ) ||
        end < start
    ) {

        return {

            years: 0,

            months: 0,

            days: 0

        };

    }


    let years =
        end.getFullYear() -
        start.getFullYear();


    let months =
        end.getMonth() -
        start.getMonth();


    let days =
        end.getDate() -
        start.getDate();


    // ==========================================
    // ADJUST DAYS
    // ==========================================

    if (
        days < 0
    ) {

        months--;


        const previousMonth =
            new Date(
                end.getFullYear(),
                end.getMonth(),
                0
            );


        days +=
            previousMonth.getDate();

    }


    // ==========================================
    // ADJUST MONTHS
    // ==========================================

    if (
        months < 0
    ) {

        years--;

        months += 12;

    }


    return {

        years:
            Math.max(
                0,
                years
            ),

        months:
            Math.max(
                0,
                months
            ),

        days:
            Math.max(
                0,
                days
            )

    };

}


// ==========================================
// FORMAT DURATION
// ==========================================

function formatDuration(
    years,
    months,
    days
) {

    let text =
        "";


    if (
        years > 0
    ) {

        text +=
            `${years} Tahun`;

    }


    if (
        months > 0
    ) {

        if (text) {

            text +=
                " ";

        }


        text +=
            `${months} Bulan`;

    }


    if (
        days > 0
    ) {

        if (text) {

            text +=
                " ";

        }


        text +=
            `${days} Hari`;

    }


    if (!text) {

        text =
            "0 Hari";

    }


    return text;

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "ms-MY",
        {

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"

        }
    );

}


// ==========================================
// READINESS SPIDER CHART
// ==========================================

function createReadinessChart(
    data
) {

    const canvas =
        document.getElementById(
            "readinessChart"
        );


    // ==========================================
    // GET VALUES
    // ==========================================

    const performance =
        Number(
            data?.performance
        ) || 0;


    const pka =
        Number(
            data?.pka
        ) || 0;


    const pki =
        Number(
            data?.pki
        ) || 0;


    const leadership =
        Number(
            data?.leadership
        ) || 0;


    // ==========================================
    // DISPLAY VALUES
    // ==========================================

    setText(
        document.getElementById(
            "readinessPerformance"
        ),
        `${performance.toFixed(2)}%`
    );


    setText(
        document.getElementById(
            "readinessPka"
        ),
        `${pka}%`
    );


    setText(
        document.getElementById(
            "readinessPki"
        ),
        `${pki}%`
    );


    setText(
        document.getElementById(
            "readinessLeadership"
        ),
        `${leadership.toFixed(2)}%`
    );


    // ==========================================
    // CHECK CANVAS
    // ==========================================

    if (!canvas) {

        console.warn(
            "Canvas readinessChart tidak dijumpai."
        );

        return;

    }


    // ==========================================
    // CHECK CHART.JS
    // ==========================================

    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js tidak dimuatkan."
        );

        return;

    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    // ==========================================
    // DESTROY OLD CHART
    // ==========================================

    if (readinessChart) {

        readinessChart.destroy();

        readinessChart = null;

    }


    // ==========================================
    // CREATE RADAR
    // ==========================================

    readinessChart =
        new Chart(
            ctx,
            {

                type:
                    "radar",


                data: {

                    labels: [

                        "Prestasi Perjawatan",

                        "Modul PKA",

                        "Modul PKI",

                        "Sejarah Jawatan"

                    ],


                    datasets: [

                        {

                            label:
                                "Leadership Readiness",


                            data: [

                                performance,

                                pka,

                                pki,

                                leadership

                            ],


                            borderWidth:
                                2,


                            pointRadius:
                                4,


                            pointHoverRadius:
                                6,


                            fill:
                                true

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    scales: {

                        r: {

                            min:
                                0,


                            max:
                                100,


                            beginAtZero:
                                true,


                            ticks: {

                                stepSize:
                                    20

                            },


                            pointLabels: {

                                font: {

                                    size:
                                        12,

                                    family:
                                        "Poppins"

                                }

                            }

                        }

                    },


                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    }

                }

            }
        );

}


// ==========================================
// LOGOUT
// ==========================================

async function logoutUser() {

    try {

        console.log(
            "Logging out..."
        );


        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );


            showMessage(
                "Gagal log keluar. Sila cuba lagi.",
                "error"
            );


            return;

        }


        console.log(
            "Logout successful."
        );


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        showMessage(
            "Gagal log keluar. Sila cuba lagi.",
            "error"
        );

    }

}


// ==========================================
// LOGOUT BUTTON
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            await logoutUser();

        }
    );

}


// ==========================================
// DROPDOWN LOGOUT
// ==========================================

if (dropdownLogoutBtn) {

    dropdownLogoutBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();

            event.stopPropagation();


            await logoutUser();

        }
    );

}


// ==========================================
// PROFILE DROPDOWN
// ==========================================

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            if (profileDropdown) {

                profileDropdown.classList.toggle(
                    "show"
                );

            }

        }
    );

}


document.addEventListener(
    "click",
    event => {

        if (

            profileDropdown &&

            !profileDropdown.contains(
                event.target
            ) &&

            !profileBtn?.contains(
                event.target
            )

        ) {

            profileDropdown.classList.remove(
                "show"
            );

        }

    }
);


// ==========================================
// HELPER - GET FIRST VALUE
// ==========================================

function getFirstValue(
    object,
    keys
) {

    if (!object) {

        return null;

    }


    for (
        const key of keys
    ) {

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
// HELPER - SET TEXT
// ==========================================

function setText(
    element,
    value
) {

    if (!element) {

        return;

    }


    element.textContent =
        value ?? "-";

}


// ==========================================
// HELPER - PERCENTAGE
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
        (
            completed /
            total
        ) * 100
    );

}


// ==========================================
// HELPER - FORMAT NUMBER
// ==========================================

function formatNumber(
    number
) {

    const value =
        Number(number) || 0;


    return Number.isInteger(
        value
    )

        ? value.toString()

        : value.toFixed(2);

}


// ==========================================
// HELPER - ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


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

        message.classList.add(
            type
        );

    }

}

