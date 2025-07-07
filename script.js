// Configuração do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, off } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase (extraída do código ESP32)
const firebaseConfig = {
    apiKey: "AIzaSyBtMCMn03EFZFhrrppsRA69g_6awF7F0b8",
    databaseURL: "https://projetoiot-cd352-default-rtdb.firebaseio.com/",
    projectId: "projetoiot-cd352",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Variáveis globais
let isConnected = false;
let sensorData = {
    soilHumidity: null,
    airHumidity: null,
    airTemperature: null,
    heatIndex: null,
};
let dataHistory = [];
let listeners = {};

// Elementos DOM
const elements = {
    // Status
    connectionStatus: document.getElementById("connectionStatus"),
    statusText: document.getElementById("statusText"),
    loadingOverlay: document.getElementById("loadingOverlay"),

    // Valores dos sensores
    soilHumidity: document.getElementById("soilHumidity"),
    airHumidity: document.getElementById("airHumidity"),
    airTemperature: document.getElementById("airTemperature"),
    heatIndex: document.getElementById("heatIndex"),

    // Barras de progresso
    soilProgress: document.getElementById("soilProgress"),
    airHumidityProgress: document.getElementById("airHumidityProgress"),
    temperatureProgress: document.getElementById("temperatureProgress"),
    heatIndexProgress: document.getElementById("heatIndexProgress"),

    // Status dos sensores
    soilStatus: document.getElementById("soilStatus"),
    airHumidityStatus: document.getElementById("airHumidityStatus"),
    temperatureStatus: document.getElementById("temperatureStatus"),
    heatIndexStatus: document.getElementById("heatIndexStatus"),

    // Última atualização
    soilLastUpdate: document.getElementById("soilLastUpdate"),
    airHumidityLastUpdate: document.getElementById("airHumidityLastUpdate"),
    temperatureLastUpdate: document.getElementById("temperatureLastUpdate"),
    heatIndexLastUpdate: document.getElementById("heatIndexLastUpdate"),

    // Histórico
    historyTableBody: document.getElementById("historyTableBody"),
    clearHistoryBtn: document.getElementById("clearHistory"),
    exportDataBtn: document.getElementById("exportData"),
};

// Funções utilitárias
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function updateConnectionStatus(connected) {
    isConnected = connected;
    elements.connectionStatus.className = `status-dot ${connected ? "connected" : "disconnected"}`;
    elements.statusText.textContent = connected ? "Conectado" : "Desconectado";

    if (connected) {
        elements.loadingOverlay.classList.add("hidden");
    }
}

function getSensorStatus(value, type) {
    switch (type) {
        case "soilHumidity":
            // Valores do sensor de umidade do solo (0-4095, onde menor = mais úmido)
            if (value < 1500) return { status: "normal", text: "Solo úmido" };
            if (value < 3000) return { status: "warning", text: "Solo moderadamente seco" };
            return { status: "danger", text: "Solo muito seco" };

        case "airHumidity":
            // Umidade do ar em porcentagem
            if (value >= 40 && value <= 70) return { status: "normal", text: "Umidade ideal" };
            if (value < 40) return { status: "warning", text: "Ar seco" };
            return { status: "warning", text: "Ar muito úmido" };

        case "temperature":
            // Temperatura em Celsius
            if (value >= 18 && value <= 26) return { status: "normal", text: "Temperatura confortável" };
            if (value < 18) return { status: "warning", text: "Temperatura baixa" };
            if (value <= 35) return { status: "warning", text: "Temperatura alta" };
            return { status: "danger", text: "Temperatura muito alta" };

        case "heatIndex":
            // Índice de calor em Celsius
            if (value < 27) return { status: "normal", text: "Confortável" };
            if (value < 32) return { status: "warning", text: "Cuidado" };
            if (value < 41) return { status: "danger", text: "Cuidado extremo" };
            return { status: "danger", text: "Perigo" };

        default:
            return { status: "normal", text: "Normal" };
    }
}

function updateSensorDisplay(sensorType, value) {
    const timestamp = Date.now();
    sensorData[sensorType] = { value, timestamp };

    let displayValue, unit, progressPercent;historyTableBody

    switch (sensorType) {
        case "soilHumidity":
            displayValue = value;
            unit = "%";
            progressPercent = displayValue;
            elements.soilHumidity.textContent = displayValue;
            elements.soilProgress.style.width = `${progressPercent}`;
            elements.soilLastUpdate.textContent = formatTime(timestamp);

            const soilStatus = getSensorStatus(value, "soilHumidity");
            elements.soilStatus.textContent = soilStatus.text;
            elements.soilStatus.className = `sensor-status ${soilStatus.status}`;
            break;

        case "airHumidity":
            displayValue = Math.round(value * 10) / 10;
            unit = "%";
            progressPercent = Math.min(value, 100);
            elements.airHumidity.textContent = displayValue;
            elements.airHumidityProgress.style.width = `${progressPercent}%`;
            elements.airHumidityLastUpdate.textContent = formatTime(timestamp);

            const airHumidityStatus = getSensorStatus(value, "airHumidity");
            elements.airHumidityStatus.textContent = airHumidityStatus.text;
            elements.airHumidityStatus.className = `sensor-status ${airHumidityStatus.status}`;
            break;

        case "airTemperature":
            displayValue = Math.round(value * 10) / 10;
            unit = "°C";
            progressPercent = Math.min(Math.max((value / 50) * 100, 0), 100);
            elements.airTemperature.textContent = displayValue;
            elements.temperatureProgress.style.width = `${progressPercent}%`;
            elements.temperatureLastUpdate.textContent = formatTime(timestamp);

            const tempStatus = getSensorStatus(value, "temperature");
            elements.temperatureStatus.textContent = tempStatus.text;
            elements.temperatureStatus.className = `sensor-status ${tempStatus.status}`;
            break;

        case "heatIndex":
            displayValue = Math.round(value * 10) / 10;
            unit = "°C";
            progressPercent = Math.min(Math.max((value / 50) * 100, 0), 100);
            elements.heatIndex.textContent = displayValue;
            elements.heatIndexProgress.style.width = `${progressPercent}%`;
            elements.heatIndexLastUpdate.textContent = formatTime(timestamp);

            const heatStatus = getSensorStatus(value, "heatIndex");
            elements.heatIndexStatus.textContent = heatStatus.text;
            elements.heatIndexStatus.className = `sensor-status ${heatStatus.status}`;
            break;
    }

    // Adicionar ao histórico se todos os sensores tiverem dados
    if (Object.values(sensorData).every((data) => data !== null)) {
        addToHistory();
    }
}

function addToHistory() {
    const now = Date.now();
    const historyEntry = {
        timestamp: now,
        soilHumidity: Math.round((sensorData.soilHumidity.value)),
        airHumidity: Math.round(sensorData.airHumidity.value * 10) / 10,
        airTemperature: Math.round(sensorData.airTemperature.value * 10) / 10,
        heatIndex: Math.round(sensorData.heatIndex.value * 10) / 10,
    };

    dataHistory.unshift(historyEntry);

    // Manter apenas os últimos 100 registros
    if (dataHistory.length > 100) {
        dataHistory = dataHistory.slice(0, 100);
    }

    updateHistoryTable();
    saveHistoryToLocalStorage();
}

function updateHistoryTable() {
    elements.historyTableBody.innerHTML = "";

    dataHistory.forEach((entry) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatTime(entry.timestamp)}</td>
            <td>${entry.soilHumidity}</td>
            <td>${entry.airHumidity}%</td>
            <td>${entry.airTemperature}°C</td>
            <td>${entry.heatIndex}°C</td>
        `;
        elements.historyTableBody.appendChild(row);
    });
}

function saveHistoryToLocalStorage() {
    try {
        localStorage.setItem("sensorHistory", JSON.stringify(dataHistory));
    } catch (error) {
        console.warn("Não foi possível salvar o histórico no localStorage:", error);
    }
}

function loadHistoryFromLocalStorage() {
    try {
        const saved = localStorage.getItem("sensorHistory");
        if (saved) {
            dataHistory = JSON.parse(saved);
            updateHistoryTable();
        }
    } catch (error) {
        console.warn("Não foi possível carregar o histórico do localStorage:", error);
    }
}

function clearHistory() {
    dataHistory = [];
    updateHistoryTable();
    localStorage.removeItem("sensorHistory");
}

function exportData() {
    if (dataHistory.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    const csvContent = [
        "Horário,Umidade Solo (%),Umidade Ar (%),Temperatura (°C),Índice Calor (°C)",
        ...dataHistory.map(
            (entry) => `${formatTime(entry.timestamp)},${entry.soilHumidity},${entry.airHumidity},${entry.airTemperature},${entry.heatIndex}`
        ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sensor_data_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function setupFirebaseListeners() {
    // Listener para umidade do solo
    const soilRef = ref(database, "umidade/solo");
    listeners.soil = onValue(
        soilRef,
        (snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                updateSensorDisplay("soilHumidity", value);
                updateConnectionStatus(true);
            }
        },
        (error) => {
            console.error("Erro ao ler umidade do solo:", error);
            updateConnectionStatus(false);
        }
    );

    // Listener para umidade do ar
    const airHumidityRef = ref(database, "umidade/ar");
    listeners.airHumidity = onValue(
        airHumidityRef,
        (snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                updateSensorDisplay("airHumidity", value);
                updateConnectionStatus(true);
            }
        },
        (error) => {
            console.error("Erro ao ler umidade do ar:", error);
            updateConnectionStatus(false);
        }
    );

    // Listener para temperatura do ar
    const temperatureRef = ref(database, "temperatura/ar");
    listeners.temperature = onValue(
        temperatureRef,
        (snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                updateSensorDisplay("airTemperature", value);
                updateConnectionStatus(true);
            }
        },
        (error) => {
            console.error("Erro ao ler temperatura do ar:", error);
            updateConnectionStatus(false);
        }
    );

    // Listener para índice de calor
    const heatIndexRef = ref(database, "temperatura/indice_calor");
    listeners.heatIndex = onValue(
        heatIndexRef,
        (snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                updateSensorDisplay("heatIndex", value);
                updateConnectionStatus(true);
            }
        },
        (error) => {
            console.error("Erro ao ler índice de calor:", error);
            updateConnectionStatus(false);
        }
    );
}

function cleanup() {
    // Remover todos os listeners
    Object.values(listeners).forEach((listener) => {
        if (listener) {
            off(listener);
        }
    });
    listeners = {};
}

// Event listeners
elements.clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
        clearHistory();
    }
});

elements.exportDataBtn.addEventListener("click", exportData);

// Cleanup ao fechar a página
window.addEventListener("beforeunload", cleanup);

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    console.log("Iniciando Dashboard de Sensores IoT...");

    // Carregar histórico salvo
    loadHistoryFromLocalStorage();

    // Configurar listeners do Firebase
    setupFirebaseListeners();

    // Timeout para conexão
    setTimeout(() => {
        if (!isConnected) {
            updateConnectionStatus(false);
            elements.loadingOverlay.classList.add("hidden");
            console.warn("Timeout na conexão com Firebase");
        }
    }, 10000);
});

// Exportar funções para debug (opcional)
window.sensorDashboard = {
    sensorData,
    dataHistory,
    clearHistory,
    exportData,
    updateConnectionStatus,
};
