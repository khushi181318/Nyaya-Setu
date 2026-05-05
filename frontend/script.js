let currentData = null;

// 🟣 BACKEND URL
const BASE_URL = "http://127.0.0.1:5000";
let allCases = [];


let chartInstance = null;

function updateChart(approved, rejected){

    let ctx = document.getElementById("caseChart").getContext("2d");

    if(chartInstance){
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Approved", "Rejected"],
            datasets: [{
                label: "Cases",
                data: [approved, rejected],
                borderWidth: 1
            }]
        }
    });
}


// 🟣 HANDLE FORM SUBMIT
document.getElementById("uploadForm").onsubmit = async function(e){
    e.preventDefault();

    let fileInput = document.getElementById("fileInput");
    let file = fileInput.files[0];

    if(!file){
        alert("⚠️ Please select a PDF file");
        return;
    }

    // 📄 PDF Preview
    document.getElementById("pdfViewer").src = URL.createObjectURL(file);

    // ⏳ Loading UI
    document.getElementById("bar").style.width = "30%";
    document.getElementById("output").innerHTML = "⏳ Analyzing document... Please wait";

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

        document.getElementById("bar").style.width="100%";
        document.getElementById("actions").style.display="block";

    }catch(err){
        alert("❌ Backend not connected!");
        console.error("ERROR:", err);
    }
};



// 🟣 UPDATE UI (SMART VERSION)
function updateUI(data){

    let statusColor = "#f59e0b"; // pending
    if(data.status === "Approved") statusColor = "green";
    if(data.status === "Rejected") statusColor = "red";

    // 📊 Confidence color
    let confidenceValue = parseInt(data.confidence);
    let confidenceColor = confidenceValue >= 70 ? "green" : (confidenceValue >= 40 ? "orange" : "red");

    document.getElementById("output").innerHTML = `
        <div class="highlight">⚖️ Decision Summary</div>

        <div><b>📄 Case Title:</b> ${data.case_title}</div>
        <div><b>📅 Date:</b> ${data.date}</div>
        <div><b>⚖️ Key Direction:</b> ${data.key_direction}</div>

        <div>
            <b>📊 Confidence:</b> 
            <span style="color:${confidenceColor}; font-weight:bold;">
                ${data.confidence}
            </span>
        </div>

        <div>
            <b>Status:</b> 
            <span style="color:${statusColor}; font-weight:bold;">
                ${data.status}
            </span>
        </div>
        <div><b>🧠 AI Summary:</b> ${data.summary}</div>
    `;
}



// 🟣 APPROVE
async function approve(){

    if(!currentData) return;

    try{
        await fetch(`${BASE_URL}/approve`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(currentData)
        });

        currentData.status = "Approved";
        updateUI(currentData);

        alert("✅ Case Approved & Saved");

    }catch(err){
        alert("❌ Error saving data");
    }
}



// 🟣 REJECT
async function reject(){

    if(!currentData) return;

    try{
        await fetch(`${BASE_URL}/reject`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(currentData)
        });

        currentData.status = "Rejected";
        updateUI(currentData);

        alert("❌ Case Rejected");

    }catch(err){
        alert("❌ Error rejecting case");
    }
}



// 🟣 EDIT
function edit(){

    if(!currentData) return;

    let newText = prompt("✏️ Edit Key Direction:", currentData.key_direction);

    if(newText){
        currentData.key_direction = newText;
        updateUI(currentData);
    }
}



// 🟣 EXPLAIN AI (UPGRADED)
function explain(){

    if(!currentData) return;

    alert(
        "🤖 NyayaSetu AI Explanation:\n\n" +
        "• Case Title → Extracted using pattern matching (vs)\n" +
        "• Date → Regex-based detection\n" +
        "• Key Direction → Legal keywords (order, shall, must)\n\n" +
        "📊 Confidence = Based on extraction completeness\n\n" +
        "⚡ This helps officers take faster decisions."
    );
}



// 🟣 DOWNLOAD REPORT
function download(){

    if(!currentData) return;

    let content = `
=========== NyayaSetu AI Report ===========

Case Title: ${currentData.case_title}
Date: ${currentData.date}

Key Direction:
${currentData.key_direction}

-----------------------------------------
Confidence: ${currentData.confidence}
Status: ${currentData.status}
-----------------------------------------

Generated by NyayaSetu AI System
`;

    let blob = new Blob([content], { type: "text/plain" });
    let a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "NyayaSetu_Report.txt";
    a.click();
}



// 🟣 TRANSLATION (FIXED + CLEAN)
function translate(){

    if(!currentData) return;

    let lang = document.getElementById("languageSelect").value;

    // reuse base data
    if(lang === "English"){
        updateUI(currentData);
        return;
    }

    if(lang === "Hindi"){
        document.getElementById("output").innerHTML = `
            <div class="highlight">⚖️ निर्णय सारांश</div>

            <div><b>📄 केस शीर्षक:</b> ${currentData.case_title}</div>
            <div><b>📅 तारीख:</b> ${currentData.date}</div>
            <div><b>⚖️ आदेश:</b> ${currentData.key_direction}</div>
            <div><b>📊 विश्वास:</b> ${currentData.confidence}</div>
            <div><b>स्थिति:</b> ${currentData.status}</div>
        `;
    }

    if(lang === "Kannada"){
        document.getElementById("output").innerHTML = `
            <div class="highlight">⚖️ ನಿರ್ಣಯ ಸಾರಾಂಶ</div>

            <div><b>📄 ಪ್ರಕರಣ ಶೀರ್ಷಿಕೆ:</b> ${currentData.case_title}</div>
            <div><b>📅 ದಿನಾಂಕ:</b> ${currentData.date}</div>
            <div><b>⚖️ ಆದೇಶ:</b> ${currentData.key_direction}</div>
            <div><b>📊 ವಿಶ್ವಾಸ:</b> ${currentData.confidence}</div>
            <div><b>ಸ್ಥಿತಿ:</b> ${currentData.status}</div>
        `;
    }
    loadCases();  // first load immediately
    async function loadCases(){

    try{
        let res = await fetch("http://127.0.0.1:5000/cases");
        let data = await res.json();

        let table = document.getElementById("caseTable");
        table.innerHTML = "";

        let total = data.length;
        let approved = 0;
        let rejected = 0;

        data.forEach(caseItem => {

            if(caseItem.status === "Approved") approved++;
            if(caseItem.status === "Rejected") rejected++;

            let row = `
            <tr>
                <td>${caseItem.case_title}</td>
                <td>${caseItem.date}</td>
                <td>${caseItem.key_direction}</td>
                <td>${caseItem.confidence}</td>
                <td>${caseItem.status}</td>
                <td>${caseItem.timestamp || "-"}</td>
            </tr>
            `;

            table.innerHTML += row;
        });

        // 📊 UPDATE STATS
        document.getElementById("total").innerText = total;
        document.getElementById("approved").innerText = approved;
        document.getElementById("rejected").innerText = rejected;

    }catch(err){
        console.error("Dashboard error:", err);
    }
}
}