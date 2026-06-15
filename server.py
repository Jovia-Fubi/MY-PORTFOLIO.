from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from pathlib import Path
import json

APP_DIR = Path(__file__).resolve().parent

app = Flask(__name__, static_folder=str(APP_DIR))
app.config['SECRET_KEY'] = 'change-me-for-production'
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='threading')

CONTACTS_FILE = APP_DIR / 'contacts.json'
if not CONTACTS_FILE.exists():
    CONTACTS_FILE.write_text('[]', encoding='utf-8')


def save_contact(data: dict):
    try:
        with CONTACTS_FILE.open('r+', encoding='utf-8') as f:
            arr = json.load(f)
            arr.append(data)
            f.seek(0)
            json.dump(arr, f, indent=2)
            f.truncate()
    except Exception as e:
        print('Failed to save contact:', e)


@app.route('/')
def index():
    return send_from_directory(str(APP_DIR), 'index.html')


@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'invalid payload'}), 400
    # Basic validation
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()
    if not name or not email or not message:
        return jsonify({'error': 'missing fields'}), 400
    entry = {'name': name, 'email': email, 'message': message}
    save_contact(entry)
    return jsonify({'status': 'ok'}), 200


@socketio.on('send_message')
def handle_send_message(payload):
    # payload expected: {name, message}
    name = payload.get('name', 'Guest') if isinstance(payload, dict) else 'Guest'
    message = payload.get('message', '') if isinstance(payload, dict) else ''
    data = {'name': name, 'message': message}
    # Broadcast to all clients
    emit('new_message', data, broadcast=True)


if __name__ == '__main__':
    print('Starting server at http://localhost:5000')
    socketio.run(app, host='0.0.0.0', port=5000)
