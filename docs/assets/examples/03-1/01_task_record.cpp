#include <iostream>
#include <string>

struct Task {
    std::string title;
    std::string owner;
    int plannedMinutes = 0;
};

int main() {
    Task task{"Review", "Mina", 30};

    task.plannedMinutes = 45;

    std::cout << task.title << " / " << task.owner << " / "
              << task.plannedMinutes << '\n';
}
