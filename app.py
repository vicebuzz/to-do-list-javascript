from flask import Flask, render_template, jsonify, request, make_response
import sys, json, os
import time

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/add_task', methods=['POST'])
def add_task():
    task_json = request.get_json()
    site_root = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(site_root, "data", "tasks.json")
    with open(json_url, 'r') as json_file:
        json_object = json.load(json_file)
    task_json_new = {task_json['taskID']:task_json}
    json_object["tasks"].update(task_json_new)
    with open(json_url, 'w') as json_file:
        json.dump(json_object, json_file)
    return f'task {task_json["taskID"]} added'

@app.route('/complete_task/<task_id>', methods=['POST'])
def complete_task(task_id):
    site_root = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(site_root, "data", "tasks.json")
    with open(json_url, 'r') as json_file:
        json_object = json.load(json_file)
    json_object["tasks"][task_id]["completed"] = True
    json_object["tasks"][task_id]["completedDate"] = time.strftime("%d/%m/%Y",time.gmtime())
    json_object["tasks"][task_id]["taskPriority"] = 'Completed'
    with open(json_url, 'w') as json_file:
        json.dump(json_object, json_file)
    return f'task {task_id} completed'

@app.route('/delete_task/<task_id>', methods=['POST'])
def delete_task(task_id):
    site_root = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(site_root, "data", "tasks.json")
    with open(json_url, 'r') as json_file:
        json_object = json.load(json_file)
    json_object["tasks"][task_id]["deleted"] = True
    json_object["tasks"][task_id]["taskPriority"] = ''
    with open(json_url, 'w') as json_file:
        json.dump(json_object, json_file)
    return f'task {task_id} deleted'

@app.route('/change_task_priority/<task_id>', methods=['POST'])
def change_task_priority(task_id):
    site_root = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(site_root, "data", "tasks.json")
    with open(json_url, 'r') as json_file:
        json_object = json.load(json_file)
    currentPriority = json_object["tasks"][task_id]["taskPriority"]
    if currentPriority == "To be done":
        json_object["tasks"][task_id]["taskPriority"] = "Prioritised"
    elif currentPriority == "Prioritised":
        json_object["tasks"][task_id]["taskPriority"] = "Urgent"
    elif currentPriority == "Urgent":
        json_object["tasks"][task_id]["taskPriority"] = "To be done"
    with open(json_url, 'w') as json_file:
        json.dump(json_object, json_file)
    return f'task {task_id} priority changed'

@app.route('/change_task_due_date/<task_id>', methods=['POST'])
def change_task_due_date(task_id):
    site_root = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(site_root, "data", "tasks.json")
    with open(json_url, 'r') as json_file:
        json_object = json.load(json_file)
    json_object["tasks"][task_id]["dueDate"] = request.get_json()['newDueDate']
    with open(json_url, 'w') as json_file:
        json.dump(json_object, json_file)
    return f'due date for task {task_id} changed'

@app.route('/get_task/<task_id>', methods=['GET'])
def get_task(task_id):
    site_root = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(site_root, "data", "tasks.json")
    with open(json_url, 'r') as json_file:
        json_object = json.load(json_file)
    return json_object["tasks"][task_id]

@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    site_root = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(site_root, "data", "tasks.json")
    with open(json_url, 'r') as json_file:
        json_object = json.load(json_file)
        return json_object
    
@app.route('/get_tasks_category/<priority>', methods=['GET'])
def get_tasks_priority(priority):
    site_root = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(site_root, "data", "tasks.json")
    with open(json_url, 'r') as json_file:
        json_object = json.load(json_file)
    output_dict = {}
    tasks = json_object["tasks"]
    for x in tasks:
        if tasks[x]["taskPriority"] == priority:
            output_dict[x] = tasks[x]
    output_json = json.dumps({"tasks":output_dict})
    return output_json


if __name__ == '__main__':
    app.run()