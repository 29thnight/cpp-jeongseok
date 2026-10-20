#include <iostream>
#include <string>

int main() {
    std::string line;
    // No prompt keeps redirected test input/output deterministic.
    if (!std::getline(std::cin, line)) {
        std::cout << "no line\n";
        return 0;
    }
    std::cout << "line=[" << line << "]\n";
    std::cout << "length=" << line.length() << '\n';
    // An empty line succeeds; EOF before any character is a failed read.
}
