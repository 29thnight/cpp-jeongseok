#include <cassert>
struct MarkerPair {
    int first_;
    int second_;
    MarkerPair() : first_{7}, second_{first_ + 1} {
        assert(first_ == 7 && second_ == 8);
    }
};
struct Counter {
    int value;
    explicit Counter(int value) : value{value} {}
    int add(int amount) {
        value += amount;
        { int value = amount + 1; assert(value == amount + 1); }
        return this->value;
    }
    int get() const;
};
int Counter::get() const { return value; }
int twice(int value) { return value + value; }
int main() {
    MarkerPair pair{};
    Counter counter{4};
    assert(counter.add(2) == 6);
    assert(counter.get() == twice(3));
    int first_ = 12;
    assert(first_ == 12 && pair.first_ == 7);
}
