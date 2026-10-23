#include <iostream>

int boundedLevel(int requested)
{
    if (requested < 0) {
        return 0;
    }
    if (requested > 100) {
        return 100;
    }

    return requested;
}

class Volume {
private:
    int level_{30};

public:
    Volume() = default;

    explicit Volume(int initialLevel)
        : level_{boundedLevel(initialLevel)}
    {
    }

    int level() const
    {
        return level_;
    }

    void setLevel(int requested)
    {
        level_ = boundedLevel(requested);
    }
};

int main()
{
    Volume normal{};
    Volume loud{135};

    std::cout << normal.level() << ' ' << loud.level() << '\n';

    loud.setLevel(42);
    normal.setLevel(-5);

    std::cout << normal.level() << ' ' << loud.level() << '\n';
}
