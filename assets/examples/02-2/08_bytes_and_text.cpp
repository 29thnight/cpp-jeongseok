#include <iostream>
#include <string>

int main() {
    // UTF-8 bytes for U+AC00, one Korean syllable. Do not print the bytes.
    std::string utf8 = "\xEA\xB0\x80";
    std::cout << "sizeof(char)=" << sizeof(char) << '\n';
    std::cout << "UTF-8 byte count=" << utf8.length() << '\n';
    std::cout << "known Unicode code points=1\n";
    // std::string counts char units, not human-perceived characters.
    // UTF-8 uses multiple bytes for many characters; sizeof(char) is always 1.
    // Do not use sizeof(std::string) to measure its stored text.
}
