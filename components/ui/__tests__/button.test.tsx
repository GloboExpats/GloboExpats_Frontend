import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button component', () => {
  it('renders with provided label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})
