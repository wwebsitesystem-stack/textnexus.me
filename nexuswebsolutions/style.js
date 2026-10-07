body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0f172a; /* Dark background */
  color: #f8fafc; /* Light text */
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.container {
  background-color: #1e293b;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
}
input, textarea {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #334155;
  background-color: #0f172a;
  color: white;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #3b82f6; /* Blue theme */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
button:hover { background-color: #2563eb; }
#status-output {
  margin-top: 20px;
  padding: 10px;
  background-color: #020617;
  border-radius: 5px;
  font-family: monospace;
  white-space: pre-wrap;
}
