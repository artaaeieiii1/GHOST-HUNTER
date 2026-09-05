/* ===================================
   GOOGLE APPS SCRIPT URL
   =================================== */

const API_URL =
    "PASTE_URL_GOOGLE_APPS_SCRIPT_DI_SINI";


/* ===================================
   DATA GAME
   =================================== */

let username = "";

let nomorWA = "";

let score = 0;

let timeLeft = 30;

let timer = null;

let playing = false;


/* ===================================
   ELEMENT
   =================================== */

const menu =
    document.getElementById("menu");

const game =
    document.getElementById("game");

const leaderboard =
    document.getElementById("leaderboard");

const ghost =
    document.getElementById("ghost");

const gameArea =
    document.getElementById("gameArea");


/* ===================================
   START GAME
   =================================== */

function startGame() {

    username =
        document
        .getElementById("username")
        .value
        .trim();


    nomorWA =
        document
        .getElementById("wa")
        .value
        .replace(/\D/g, "");


    /* VALIDASI USERNAME */

    if (username.length < 2) {

        showMessage(
            "Username minimal 2 karakter!"
        );

        return;
    }


    /* VALIDASI WA */

    if (!/^08\d{8,13}$/.test(nomorWA)) {

        showMessage(
            "Nomor WhatsApp tidak valid!"
        );

        return;
    }


    /* RESET GAME */

    score = 0;

    timeLeft = 30;

    playing = true;


    document
        .getElementById("score")
        .textContent = score;


    document
        .getElementById("time")
        .textContent = timeLeft;


    document
        .getElementById("playerName")
        .textContent = username;


    menu.classList.add("hidden");

    leaderboard.classList.add("hidden");

    game.classList.remove("hidden");


    moveGhost();


    clearInterval(timer);


    timer = setInterval(() => {

        timeLeft--;

        document
            .getElementById("time")
            .textContent = timeLeft;


        if (timeLeft <= 0) {

            finishGame();

        }

    }, 1000);

}


/* ===================================
   HANTU DIPINDAHKAN
   =================================== */

function moveGhost() {

    if (!playing) return;


    const areaWidth =
        gameArea.clientWidth;


    const areaHeight =
        gameArea.clientHeight;


    const ghostWidth =
        ghost.offsetWidth;


    const ghostHeight =
        ghost.offsetHeight;


    const maxX =
        areaWidth - ghostWidth;


    const maxY =
        areaHeight - ghostHeight;


    const x =
        Math.random() * maxX;


    const y =
        Math.random() * maxY;


    ghost.style.left =
        x + "px";


    ghost.style.top =
        y + "px";

}


/* ===================================
   KLIK HANTU
   =================================== */

ghost.addEventListener(
    "click",
    function() {

        if (!playing) return;


        score += 10;


        document
            .getElementById("score")
            .textContent = score;


        moveGhost();

    }
);


/* ===================================
   GAME SELESAI
   =================================== */

function finishGame() {

    if (!playing) return;


    playing = false;


    clearInterval(timer);


    ghost.style.left =
        "50%";

    ghost.style.top =
        "50%";


    saveScore();

}


/* ===================================
   SIMPAN SKOR
   =================================== */

function saveScore() {

    fetch(API_URL, {

        method: "POST",

        body: JSON.stringify({

            action: "saveScore",

            username: username,

            wa: nomorWA,

            score: score

        })

    })

    .then(response =>
        response.json()
    )

    .then(data => {

        alert(
            "👻 GAME SELESAI!\n\n" +
            "Username: " +
            username +
            "\nSkor: " +
            score
        );


        showLeaderboard();

    })

    .catch(error => {

        console.error(error);

        alert(
            "Skor kamu: " +
            score +
            "\n\nGagal terhubung ke Google Sheets."
        );

        showLeaderboard();

    });

}


/* ===================================
   LEADERBOARD
   =================================== */

function showLeaderboard() {

    menu.classList.add("hidden");

    game.classList.add("hidden");

    leaderboard.classList.remove("hidden");


    const table =
        document.getElementById(
            "leaderboardData"
        );


    table.innerHTML = `
        <tr>
            <td colspan="4">
                ⏳ Memuat leaderboard...
            </td>
        </tr>
    `;


    fetch(API_URL, {

        method: "POST",

        body: JSON.stringify({

            action: "leaderboard"

        })

    })

    .then(response =>
        response.json()
    )

    .then(data => {

        if (!data.rows ||
            data.rows.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        Belum ada pemain.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML = "";


        data.rows.forEach(
            (row, index) => {

                const tr =
                    document.createElement("tr");


                tr.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHTML(row[0])}
                    </td>

                    <td>
                        👻 ${row[2]}
                    </td>

                    <td>
                        ${formatDate(row[3])}
                    </td>

                `;


                table.appendChild(tr);

            }
        );

    })

    .catch(error => {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    ❌ Gagal mengambil data.
                </td>
            </tr>
        `;

    });

}


/* ===================================
   KEMBALI MENU
   =================================== */

function backMenu() {

    clearInterval(timer);

    playing = false;

    game.classList.add("hidden");

    leaderboard.classList.add("hidden");

    menu.classList.remove("hidden");

}


/* ===================================
   PESAN
   =================================== */

function showMessage(message) {

    document
        .getElementById("message")
        .textContent = message;

}


/* ===================================
   FORMAT TANGGAL
   =================================== */

function formatDate(date) {

    if (!date) return "-";


    return new Date(date)
        .toLocaleString("id-ID");

}


/* ===================================
   KEAMANAN HTML
   =================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent = text;


    return div.innerHTML;

}
