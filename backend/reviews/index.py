import json
import os
from typing import Dict, Any, List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

def json_serializer(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

class ReviewCreate(BaseModel):
    loan_id: int = Field(..., ge=1)
    author_name: str = Field(..., min_length=1, max_length=255)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=10, max_length=2000)

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с отзывами: получение отзывов по займу, создание нового отзыва
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            loan_id = query_params.get('loan_id')
            
            if not loan_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'loan_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                SELECT * FROM reviews 
                WHERE loan_id = %s AND is_approved = true 
                ORDER BY created_at DESC
            ''', (loan_id,))
            
            reviews = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(review) for review in reviews], ensure_ascii=False, default=json_serializer),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            review_data = ReviewCreate(**body_data)
            
            cur.execute('''
                INSERT INTO reviews (loan_id, author_name, rating, comment, is_approved)
                VALUES (%s, %s, %s, %s, false)
                RETURNING *
            ''', (
                review_data.loan_id,
                review_data.author_name,
                review_data.rating,
                review_data.comment
            ))
            
            new_review = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Отзыв отправлен на модерацию',
                    'review': dict(new_review)
                }, ensure_ascii=False, default=json_serializer),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
