#include <iostream>
#include <limits>
#include <string>

int main() {
    int age = 0;
    if (!(std::cin >> age)) {
        std::cout << "invalid number\n";
        return 0;
    }
    // Discard the rest of the number's line, including its newline.
    // The name must be on the NEXT line. Same-line text is discarded.
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    std::string name;
    if (!std::getline(std::cin, name)) {
        std::cout << "no name line\n";
        return 0;
    }
    std::cout << "age=" << age << '\n';
    std::cout << "name=[" << name << "]\n";
}
