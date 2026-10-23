#include <iostream>
#include <string>

enum class TaskState {
    Todo,
    Doing,
    Done
};

struct Task {
    std::string title = "Untitled";
    std::string owner = "Unassigned";
    int plannedMinutes = 0;
    TaskState state = TaskState::Todo;
};

std::string stateName(TaskState state) {
    if (state == TaskState::Todo) {
        return "Todo";
    }

    if (state == TaskState::Doing) {
        return "Doing";
    }

    if (state == TaskState::Done) {
        return "Done";
    }

    return "Unknown";
}

void printTask(const Task& task) {
    std::cout << task.title << " / " << task.owner << " / "
              << task.plannedMinutes << " / " << stateName(task.state) << '\n';
}

Task withState(const Task& task, TaskState state) {
    Task result = task;

    result.state = state;

    return result;
}

int main() {
    Task original{"Review", "Mina", 30, TaskState::Todo};
    Task started = withState(original, TaskState::Doing);

    printTask(original);
    printTask(started);
}
