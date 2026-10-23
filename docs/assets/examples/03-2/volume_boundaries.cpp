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

#include <climits>
int main()
{
    const int inputs[]{INT_MIN, -1, 0, 1, 99, 100, 101, INT_MAX};
    const int expected[]{0, 0, 0, 1, 99, 100, 100, 100};
    for (int i = 0; i < 8; ++i) {
        Volume constructed{inputs[i]};
        Volume assigned{};
        assigned.setLevel(inputs[i]);
        std::cout << inputs[i] << ": " << constructed.level() << ' ' << assigned.level() << '\n';
        if (constructed.level() != expected[i] || assigned.level() != expected[i]) return 1;
    }
    return 0;
}
