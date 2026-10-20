#include <iostream>
#include <string>

int main() {
    std::string text = "aba";
    std::cout << "a from 1=" << text.find('a', 1) << '\n';
    std::cout << "empty at end=" << text.find("", text.length()) << '\n';
    std::cout << std::boolalpha;
    std::cout << "a at end missing="
              << (text.find('a', text.length()) == std::string::npos) << '\n';
    std::cout << "past end missing="
              << (text.find("", text.length() + 1) == std::string::npos) << '\n';
    std::string empty;
    std::cout << "empty in empty=" << empty.find("") << '\n';
    std::cout << "a in empty missing="
              << (empty.find('a') == std::string::npos) << '\n';
}
