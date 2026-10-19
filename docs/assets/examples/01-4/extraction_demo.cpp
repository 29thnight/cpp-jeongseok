#include <iostream>

int main() {
    int first = 0;
    int second = 0;

    if (std::cin >> first) {
        std::cout << "First integer: " << first << '\n';
    } else {
        std::cout << "First extraction failed.\n";
        return 0;
    }

    if (std::cin >> second) {
        std::cout << "Second integer: " << second << '\n';
    } else {
        std::cout << "Second extraction failed.\n";
    }
    return 0;
}
