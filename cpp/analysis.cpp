#include <emscripten.h>
#include <string>

extern "C" {

EMSCRIPTEN_KEEPALIVE
int word_count(const char* text) {
    std::string str(text);
    int count = 0, inWord = 0;

    for (char c : str) {
        if (isspace(c)) {
            if (inWord) {
                count++;
                inWord = 0;
            }
        } else {
            inWord = 1;
        }
    }

    if (inWord) count++;

    return count;
}

}
