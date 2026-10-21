#include <initializer_list>
#include <iostream>
#include <string>

int main()
{
    auto whole = 5 / 2;
    auto fraction = 5.0 / 2;
    const int source = 8;
    auto copy = source;
    copy = 9;
    const auto fixed = source;
    auto one{1};
    auto list = {1};
    auto title = std::string{"Quiz"};
    std::cout << whole << ' ' << fraction << '\n';
    std::cout << source << ' ' << copy << ' ' << fixed << '\n';
    std::cout << one << ' ' << list.size() << ' ' << title << '\n';
}
