# Mario Demo

This project is a simple platformer demo inspired by classic 2D side-scrollers. The stage clear screen now includes a simple star animation effect, sliding triggers a brief dust animation, and a one-minute countdown timer adds urgency. When time runs out before reaching the goal, a fail screen with a restart option appears.

## Testing

Install dependencies and run the test suite:

```sh
npm install
npm test
```

The tests verify collision handling and coin collection logic. Continuous integration runs the same command on each push and pull request.
