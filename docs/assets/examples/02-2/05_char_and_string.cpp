#include <iostream>
#include <string>

int main() {
    char letter = 'A'; // Single quotes: one char.
    std::string word = "A"; // Double quotes: a string literal initializes string.
    std::string repeated(3, letter);
    word += '!';
    std::cout << "letter=" << letter << '\n';
    std::cout << "word=" << word << '\n';
    std::cout << "repeated=" << repeated << '\n';
    std::string empty = ""; // There is no empty char literal.
    std::cout << "empty length=" << empty.length() << '\n';
}
