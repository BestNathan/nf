export function randomHexStr(count: number) {
  return random(count, '1234567890ABCDEF');
}

export function random(count: number, basestr: string) {
  var res = '';
  for (var i = 0; i < count; i++) {
    res += basestr.charAt(Math.floor(Math.random() * basestr.length));
  }
  return res;
}
