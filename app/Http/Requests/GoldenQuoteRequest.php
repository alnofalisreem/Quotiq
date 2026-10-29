<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GoldenQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'content' => is_string($this->input('content'))
                ? trim($this->input('content'))
                : $this->input('content'),
        ]);
    }

    public function rules(): array
    {
        return ['content' => ['required', 'string', 'min:3', 'max:155']];
    }
}
