#include <stdint.h> // for uint8_t & uint32_t

// the address of this symbol denotes the start of the WebAssembly.Memory
extern uint8_t memory;

// attribute to denote functions that should not be stripped by clang -fvisibility=hidden
#define WASM_EXPORT __attribute__((visibility("default")))

// see: https://en.wikipedia.org/wiki/Lehmer_random_number_generator#Sample_C99_code
static uint32_t _rand() {
  static uint32_t _rng_state = 42;
  return _rng_state = (uint64_t)_rng_state * 48271 % 0x7fffffff;
}

// generate some random noise
WASM_EXPORT void go(int width, int height) {

  // obtain a pointer to our memory
  uint8_t* im = (uint8_t *)&memory;

  // treat the memory as a row-major pixel buffer
  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {

      // row-major order, 4 channels (RGBA)
      int offset = (y * width + x) * 4;

      // random color
      im[offset] = _rand() % 255; // R
      im[offset + 1] = _rand() % 255; // G
      im[offset + 2] = _rand() % 255; // B

      // opaque alpha
      im[offset + 3] = 255;
    }
  }
}
