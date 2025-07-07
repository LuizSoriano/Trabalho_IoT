# Dashboard de Sensores IoT

Um website moderno e responsivo para visualizar dados de sensores IoT em tempo real, conectado ao Firebase Realtime Database.

## 📋 Funcionalidades

- **Visualização em Tempo Real**: Exibe dados dos sensores atualizados automaticamente
- **Interface Moderna**: Design responsivo com gradientes e animações suaves
- **Indicadores Visuais**: Barras de progresso e status coloridos para cada sensor
- **Histórico de Dados**: Tabela com histórico das últimas 100 leituras
- **Exportação**: Possibilidade de exportar dados em formato CSV
- **Status de Conexão**: Indicador visual do status da conexão com Firebase

## 🌡️ Sensores Monitorados

1. **Umidade do Solo** - Medida em valor absoluto
2. **Umidade do Ar** - Medida em porcentagem (0-100%)
3. **Temperatura do Ar** - Medida em graus Celsius (°C)
4. **Índice de Calor** - Calculado em graus Celsius (°C)

## 🔧 Configuração

### Credenciais do Firebase

O website está configurado para conectar ao Firebase com as seguintes credenciais:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBtMCMn03EFZFhrrppsRA69g_6awF7F0b8",
    databaseURL: "https://projetoiot-cd352-default-rtdb.firebaseio.com/",
    projectId: "projetoiot-cd352"
};
```

### Estrutura dos Dados no Firebase

Os dados são organizados no Firebase da seguinte forma:

```
/
├── umidade/
│   ├── solo (valor numérico)
│   └── ar (valor numérico 0-100)
└── temperatura/
    ├── ar (valor numérico em °C)
    └── indice_calor (valor numérico em °C)
```

## 🚀 Como Usar

### Método 1: Servidor HTTP Local

1. Navegue até o diretório do projeto:
   ```bash
   cd sensor-dashboard
   ```

2. Inicie um servidor HTTP local:
   ```bash
   python3 -m http.server 8080
   ```

3. Abra o navegador e acesse:
   ```
   http://localhost:8080
   ```

### Método 2: Servidor Web

1. Faça upload dos arquivos para seu servidor web
2. Acesse o arquivo `index.html` através do navegador

## 📁 Estrutura do Projeto

```
sensor-dashboard/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # JavaScript principal
└── README.md           # Documentação
```

## 🎨 Características do Design

- **Tema Escuro**: Interface moderna com cores escuras
- **Gradientes**: Uso de gradientes para elementos visuais
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Animações**: Transições suaves e efeitos hover
- **Tipografia**: Fonte Inter para melhor legibilidade

## 📊 Status dos Sensores

### Umidade do Solo
- **Verde (Normal)**: Solo úmido (< 1500)
- **Amarelo (Atenção)**: Solo moderadamente seco (1500-3000)
- **Vermelho (Perigo)**: Solo muito seco (> 3000)

### Umidade do Ar
- **Verde (Normal)**: Umidade ideal (40-70%)
- **Amarelo (Atenção)**: Ar seco (< 40%) ou muito úmido (> 70%)

### Temperatura do Ar
- **Verde (Normal)**: Temperatura confortável (18-26°C)
- **Amarelo (Atenção)**: Temperatura baixa (< 18°C) ou alta (26-35°C)
- **Vermelho (Perigo)**: Temperatura muito alta (> 35°C)

### Índice de Calor
- **Verde (Normal)**: Confortável (< 27°C)
- **Amarelo (Atenção)**: Cuidado (27-32°C)
- **Vermelho (Perigo)**: Cuidado extremo (32-41°C) ou Perigo (> 41°C)

## 🔄 Funcionalidades Avançadas

- **Armazenamento Local**: Histórico salvo no localStorage do navegador
- **Exportação CSV**: Download dos dados em formato CSV
- **Limpeza de Histórico**: Opção para limpar todos os dados salvos
- **Reconexão Automática**: Tentativa automática de reconexão ao Firebase

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com Flexbox e Grid
- **JavaScript ES6+**: Lógica da aplicação
- **Firebase SDK**: Conexão com Realtime Database
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia (Inter)

## 📱 Compatibilidade

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móveis (iOS/Android)

## 🔒 Segurança

- Conexão segura via HTTPS com Firebase
- Validação de dados no frontend
- Tratamento de erros de conexão

## 📝 Notas Importantes

1. **Conexão com Internet**: Necessária para conectar ao Firebase
2. **CORS**: O website deve ser servido via HTTP/HTTPS (não file://)
3. **Dados em Tempo Real**: Atualizações automáticas quando o ESP32 envia novos dados
4. **Limite de Histórico**: Mantém apenas os últimos 100 registros para performance

## 🐛 Solução de Problemas

### Website não carrega
- Verifique se está sendo servido via HTTP/HTTPS
- Confirme a conexão com internet

### Dados não aparecem
- Verifique se o ESP32 está enviando dados
- Confirme as credenciais do Firebase
- Verifique o console do navegador para erros

### Status "Desconectado"
- Verifique a conexão com internet
- Confirme se o Firebase está acessível
- Aguarde alguns segundos para reconexão automática

