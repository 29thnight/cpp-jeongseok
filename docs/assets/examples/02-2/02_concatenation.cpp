#include <iostream>
#include <string>

int main() {
    std::string name = "Mina";
    std::string greeting = "Hello, " + name;
    greeting += '!';
    std::cout << greeting << '\n';
    std::string empty;
    std::cout << "empty + name=" << empty + name << '\n';
    // Two string literals cannot be added with +. Start with std::string.
    std::cout << std::string("C") + "++" << '\n';
}
