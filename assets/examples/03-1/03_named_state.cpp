#include <iostream>
#include <string>

enum class TaskState {
    Todo,
    Doing,
    Done
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

int main() {
    int choice = 0;
    TaskState state = TaskState::Todo;

    std::cin >> choice;

    if (!std::cin || choice < 1 || choice > 3) {
        std::cout << "Invalid input\n";
        return 0;
    }

    if (choice == 2) {
        state = TaskState::Doing;
    } else if (choice == 3) {
        state = TaskState::Done;
    }

    std::cout << stateName(state) << '\n';
}
