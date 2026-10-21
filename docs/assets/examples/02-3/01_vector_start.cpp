#include <iostream>
#include <string>
#include <vector>

int main()
{
    std::vector<std::string> names{"Mina", "Jun", "Sol"};

    std::cout << "before: " << names.size() << '\n';
    std::cout << "first: " << names[0] << '\n';

    names[1] = "Jin";
    names.push_back("Ara");

    std::cout << "after: " << names.size() << '\n';
    std::cout << "names:";
    for (auto name : names)
    {
        std::cout << ' ' << name;
    }
    std::cout << '\n';
}
