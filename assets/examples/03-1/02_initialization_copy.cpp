#include <iostream>
#include <string>

struct Task {
    std::string title = "Untitled";
    std::string owner = "Unassigned";
    int plannedMinutes = 15;
};

int main() {
    Task empty{};
    Task original{"Review", "Mina", 30};
    Task copy = original;
    Task partial{"Outline"};

    copy.owner = "Joon";
    copy.plannedMinutes = 50;

    std::cout << empty.title << " / " << empty.plannedMinutes << '\n';
    std::cout << partial.title << " / " << partial.owner << " / "
              << partial.plannedMinutes << '\n';
    std::cout << original.owner << " / " << original.plannedMinutes << '\n';
    std::cout << copy.owner << " / " << copy.plannedMinutes << '\n';
}
