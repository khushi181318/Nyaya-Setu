let currentData = null;

// 🟣 BACKEND URL
const BASE_URL = "http://127.0.0.1:5000";


// ===============================
// 🟣 HANDLE FORM SUBMIT
// ===============================
document.getElementById("uploadForm").onsubmit = async function(e){

    e.preventDefault();

    let fileInput = document.getElementById("fileInput");
    let file = fileInput.files[0];

    if(!file){
        alert("⚠️ Please select a PDF file");
        return;
    }

    // 📄 PDF Preview
    document.getElementById("pdfViewer").src =
        URL.createObjectURL(file);

    // ⏳ Loading
    document.getElementById("bar").style.width = "30%";

    document.getElementById("output").innerHTML =
        "⏳ Analyzing document... Please wait";

    let formData = new FormData();
    formData.append("file", file);

    try{

        let res = await fetch(`${BASE_URL}/upload`,{
            method:"POST",
            body:formData
        });

        if(!res.ok){
            throw new Error("Server error");
        }

        let data = await res.json();

        if(data.error){
            alert("❌ " + data.error);
            return;
        }

        currentData = data;

        updateUI(currentData);

        document.getElementById("bar").style.width = "100%";

        document.getElementById("actions").style.display = "block";

    }catch(err){

        alert("❌ Backend not connected!");

        console.error(err);
    }
};


// ===============================
// 🟣 UPDATE UI
// ===============================
function updateUI(data){

    let statusColor = "#f59e0b";

    if(data.status === "Approved"){
        statusColor = "green";
    }

    if(data.status === "Rejected"){
        statusColor = "red";
    }

    // confidence color
    let confidenceValue = parseInt(data.confidence);

    let confidenceColor =
        confidenceValue >= 70
        ? "green"
        : confidenceValue >= 40
        ? "orange"
        : "red";

    document.getElementById("output").innerHTML = `

        <div class="highlight">
            ⚖️ Decision Summary
        </div>

        <div>
            <b>📄 Case Title:</b>
            ${data.case_title}
        </div>

        <div>
            <b>📅 Date:</b>
            ${data.date}
        </div>

        <div>
            <b>⚖️ Key Direction:</b>
            ${data.key_direction}
        </div>

        <div>
            <b>🧠 AI Summary:</b>
            ${data.summary || "Not available"}
        </div>

        <div>
            <b>📊 Confidence:</b>

            <span style="
                color:${confidenceColor};
                font-weight:bold;
            ">
                ${data.confidence}
            </span>
        </div>

        <div>
            <b>Status:</b>

            <span style="
                color:${statusColor};
                font-weight:bold;
            ">
                ${data.status}
            </span>
        </div>
    `;
}


// ===============================
// 🟣 APPROVE
// ===============================
async function approve(){

    if(!currentData) return;

    try{

        await fetch(`${BASE_URL}/approve`,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(currentData)
        });

        currentData.status = "Approved";

        updateUI(currentData);

        alert("✅ Case Approved & Saved");

    }catch(err){

        alert("❌ Error saving data");
    }
}


// ===============================
// 🟣 REJECT
// ===============================
async function reject(){

    if(!currentData) return;

    try{

        await fetch(`${BASE_URL}/reject`,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(currentData)
        });

        currentData.status = "Rejected";

        updateUI(currentData);

        alert("❌ Case Rejected");

    }catch(err){

        alert("❌ Error rejecting case");
    }
}


// ===============================
// 🟣 EDIT
// ===============================
function edit(){

    if(!currentData) return;

    let newText = prompt(
        "✏️ Edit Key Direction:",
        currentData.key_direction
    );

    if(newText){

        currentData.key_direction = newText;

        updateUI(currentData);
    }
}


// ===============================
// 🟣 EXPLAIN AI
// ===============================
function explain(){

    if(!currentData) return;

    alert(

        "🤖 NyayaSetu AI Explanation:\n\n" +

        "• Case Title → Extracted using regex matching\n" +

        "• Date → Extracted using pattern detection\n" +

        "• Key Direction → Legal keywords like order, shall, must\n\n" +

        "📊 Confidence score is based on extraction quality."
    );
}


// ===============================
// 🟣 DOWNLOAD REPORT
// ===============================
function download(){

    if(!currentData) return;

    let content = `

=========== NyayaSetu AI Report ===========

Case Title: ${currentData.case_title}

Date: ${currentData.date}

Key Direction:
${currentData.key_direction}

AI Summary:
${currentData.summary}

Confidence:
${currentData.confidence}

Status:
${currentData.status}

Generated by NyayaSetu AI System

`;

    let blob = new Blob(
        [content],
        { type: "text/plain" }
    );

    let a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "NyayaSetu_Report.txt";

    a.click();
}


// ===============================
// 🟣 TRANSLATE
// ===============================
function translate(){

    if(!currentData) return;

    let lang =
        document.getElementById("languageSelect").value;

    // English
    if(lang === "English"){

        updateUI(currentData);

        return;
    }

    // Hindi
    if(lang === "Hindi"){

        document.getElementById("output").innerHTML = `

            <div class="highlight">
                ⚖️ निर्णय सारांश
            </div>

            <div>
                <b>📄 केस शीर्षक:</b>
                ${currentData.case_title}
            </div>

            <div>
                <b>📅 तारीख:</b>
                ${currentData.date}
            </div>

            <div>
                <b>⚖️ आदेश:</b>
                ${currentData.key_direction}
            </div>

            <div>
                <b>🧠 AI सारांश:</b>
                ${currentData.summary}
            </div>

            <div>
                <b>📊 विश्वास:</b>
                ${currentData.confidence}
            </div>

            <div>
                <b>स्थिति:</b>
                ${currentData.status}
            </div>
        `;
    }

    // Kannada
    if(lang === "Kannada"){

        document.getElementById("output").innerHTML = `

            <div class="highlight">
                ⚖️ ನಿರ್ಣಯ ಸಾರಾಂಶ
            </div>

            <div>
                <b>📄 ಪ್ರಕರಣ ಶೀರ್ಷಿಕೆ:</b>
                ${currentData.case_title}
            </div>

            <div>
                <b>📅 ದಿನಾಂಕ:</b>
                ${currentData.date}
            </div>

            <div>
                <b>⚖️ ಆದೇಶ:</b>
                ${currentData.key_direction}
            </div>

            <div>
                <b>🧠 AI ಸಾರಾಂಶ:</b>
                ${currentData.summary}
            </div>

            <div>
                <b>📊 ವಿಶ್ವಾಸ:</b>
                ${currentData.confidence}
            </div>

            <div>
                <b>ಸ್ಥಿತಿ:</b>
                ${currentData.status}
            </div>
        `;
    }
}
