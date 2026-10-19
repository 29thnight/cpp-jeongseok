#include <iostream>
#include <limits>

int main() {
    const int price = 150;
    const int totalLimit = 2000;
    int total = 0;

    while (true) {
        std::cout << "Quantity (1-9, 0 to finish):\n";
        int quantity = 0;

        if (!(std::cin >> quantity)) {
            // A broken stream or end of input cannot be repaired by asking again.
            if (std::cin.bad()) {
                std::cout << "Input stream error.\n";
                break;
            }
            if (std::cin.eof()) {
                std::cout << "End of input.\n";
                break;
            }

            // Clear failbit before discarding the remainder of this line.
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "Invalid integer; discarded the rest of this line.\n";
            continue;
        }

        if (quantity == 0) {
            break;
        }
        if (quantity < 1 || quantity > 9) {
            std::cout << "Quantity must be 1-9.\n";
            continue;
        }

        // quantity is now 1-9, so amount is safely bounded by 1350.
        const int amount = quantity * price;
        // total stays in 0-2000. Compare before adding to avoid overflow.
        if (amount > totalLimit - total) {
            std::cout << "Total limit exceeded; order not added.\n";
            continue;
        }
        total += amount;
        std::cout << "Added " << amount << "; total " << total << ".\n";
    }

    std::cout << "Final total: " << total << ".\n";
    return 0;
}
