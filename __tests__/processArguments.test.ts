import { processArguments } from '../src/action'

// --

const OLD_ENV = process.env

beforeEach(() => {
  jest.resetModules() // this is important - it clears the cache
  process.env = { ...OLD_ENV }
  delete process.env.NODE_ENV
})

afterEach(() => {
  process.env = OLD_ENV
})

test('fail if authentication is not provided', () => {
  const run = () => processArguments()
  expect(run).toThrow()
})

test('obtain auth credentials from the environment', () => {
  process.env.CLEVER_TOKEN = 'token'
  process.env.CLEVER_SECRET = 'secret'
  const args = processArguments()
  expect(args.token).toEqual('token')
  expect(args.secret).toEqual('secret')
})

test('extra env', () => {
  process.env.INPUT_SETENV = `
  FOO=foo
  BAR=bar

  # empty line or comment is ignored
  lowercase=blah
  123=456
  many_equals=dod==d=doodod=d
`
  process.env.CLEVER_TOKEN = 'token'
  process.env.CLEVER_SECRET = 'secret'
  const args = processArguments()
  expect(args.extraEnv).toBeDefined()
  expect(args.extraEnv!.FOO).toEqual('foo')
  expect(args.extraEnv!.BAR).toEqual('bar')
  expect(args.extraEnv!.lowercase).toEqual('blah')
  expect(args.extraEnv!['123']).toEqual('456')
  expect(args.extraEnv!.many_equals).toEqual('dod==d=doodod=d')
  expect(args.extraEnv!.EVIL).toBeUndefined()
})

test('timeout, default value is undefined', () => {
  process.env.CLEVER_TOKEN = 'token'
  process.env.CLEVER_SECRET = 'secret'
  process.env.INPUT_TIMEOUT = undefined
  const args = processArguments()
  expect(args.timeout).toBeUndefined()
})

test('timeout, default value is a number', () => {
  process.env.CLEVER_TOKEN = 'token'
  process.env.CLEVER_SECRET = 'secret'
  process.env.INPUT_TIMEOUT = '1800'
  const args = processArguments()
  expect(args.timeout).toEqual(1800)
})

test('timeout, default value is not a number', () => {
  process.env.CLEVER_TOKEN = 'token'
  process.env.CLEVER_SECRET = 'secret'
  process.env.INPUT_TIMEOUT = 'nope'
  const args = processArguments()
  expect(args.timeout).toBeUndefined()
})
