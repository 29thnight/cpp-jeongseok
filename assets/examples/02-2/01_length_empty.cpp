#include <iostream>
#include <string>

int main() {
    std::string title = "C++";
    std::string blank;
    std::cout << "title length=" << title.length() << '\n';
    std::cout << std::boolalpha;
    std::cout << "blank empty=" << blank.empty() << '\n';
    blank = " "; // One space is still a character.
    std::cout << "space empty=" << blank.empty() << '\n';
}
