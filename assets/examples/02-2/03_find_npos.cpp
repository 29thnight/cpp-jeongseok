#include <iostream>
#include <string>

int main() {
    std::string text = "banana";
    // auto keeps the correct unsigned position type without a conversion.
    auto position = text.find("ana");
    if (position != std::string::npos) {
        std::cout << "ana at=" << position << '\n';
    }
    if (text.find("pear") == std::string::npos) {
        std::cout << "pear not found\n";
    }
    if (text.find("ban") == 0) {
        std::cout << "ban starts at zero\n";
    }
    // Never use if (text.find(...)): zero is a successful match!
}
