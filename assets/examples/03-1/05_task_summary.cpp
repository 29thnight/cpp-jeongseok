#include <iostream>
#include <string>
#include <vector>

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

struct TaskSummary {
    int doneCount = 0;
    int unfinishedMinutes = 0;
};

TaskSummary summarize(const std::vector<Task>& tasks) {
    TaskSummary result{};

    for (const auto& task : tasks) {
        if (task.state == TaskState::Done) {
            ++result.doneCount;
        } else {
            result.unfinishedMinutes += task.plannedMinutes;
        }
    }

    return result;
}

void printSummary(const TaskSummary& summary) {
    std::cout << "Done: " << summary.doneCount << '\n';
    std::cout << "Unfinished planned minutes: "
              << summary.unfinishedMinutes << '\n';
}

int main() {
    std::vector<Task> tasks{
        {"Outline", "Mina", 20, TaskState::Done},
        {"Review", "Joon", 30, TaskState::Doing},
        {"Publish", "Mina", 10, TaskState::Todo}
    };
    std::vector<Task> emptyTasks{};
    TaskSummary summary = summarize(tasks);
    TaskSummary emptySummary = summarize(emptyTasks);

    printSummary(summary);
    printSummary(emptySummary);
}
