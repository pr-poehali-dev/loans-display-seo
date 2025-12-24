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

class LoanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    logo: str = Field(..., min_length=1, max_length=10)
    amount_min: int = Field(..., ge=0)
    amount_max: int = Field(..., ge=0)
    term_min: int = Field(..., ge=1)
    term_max: int = Field(..., ge=1)
    rate: float = Field(..., ge=0)
    approval_rate: int = Field(..., ge=0, le=100)
    rating: float = Field(..., ge=0, le=5)
    reviews: int = Field(default=0, ge=0)
    features: List[str]
    requirements: List[str]
    color: str = Field(..., min_length=1)
    is_active: bool = Field(default=True)

class LoanUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    amount_min: Optional[int] = None
    amount_max: Optional[int] = None
    term_min: Optional[int] = None
    term_max: Optional[int] = None
    rate: Optional[float] = None
    approval_rate: Optional[int] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    features: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления займами: получение списка, создание, обновление, удаление
    Args: event - dict с httpMethod, body, queryStringParameters, pathParams
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
            loan_id = query_params.get('id')
            
            if loan_id:
                cur.execute('SELECT * FROM loans WHERE id = %s', (loan_id,))
                loan = cur.fetchone()
                if not loan:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Займ не найден'}),
                        'isBase64Encoded': False
                    }
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(loan), ensure_ascii=False, default=json_serializer),
                    'isBase64Encoded': False
                }
            
            active_only = query_params.get('active', 'true').lower() == 'true'
            if active_only:
                cur.execute('SELECT * FROM loans WHERE is_active = true ORDER BY rating DESC, clicks DESC')
            else:
                cur.execute('SELECT * FROM loans ORDER BY rating DESC, clicks DESC')
            
            loans = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(loan) for loan in loans], ensure_ascii=False, default=json_serializer),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            loan_data = LoanCreate(**body_data)
            
            cur.execute('''
                INSERT INTO loans (name, logo, amount_min, amount_max, term_min, term_max, 
                                 rate, approval_rate, rating, reviews, features, requirements, 
                                 color, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            ''', (
                loan_data.name, loan_data.logo, loan_data.amount_min, loan_data.amount_max,
                loan_data.term_min, loan_data.term_max, loan_data.rate, loan_data.approval_rate,
                loan_data.rating, loan_data.reviews, loan_data.features, loan_data.requirements,
                loan_data.color, loan_data.is_active
            ))
            
            new_loan = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_loan), ensure_ascii=False, default=json_serializer),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParams') or {}
            loan_id = path_params.get('id')
            
            if not loan_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID займа обязателен'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            loan_data = LoanUpdate(**body_data)
            
            update_fields = []
            update_values = []
            
            for field, value in loan_data.model_dump(exclude_unset=True).items():
                if value is not None:
                    update_fields.append(f'{field} = %s')
                    update_values.append(value)
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нет полей для обновления'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append('updated_at = NOW()')
            update_values.append(loan_id)
            
            query = f"UPDATE loans SET {', '.join(update_fields)} WHERE id = %s RETURNING *"
            cur.execute(query, update_values)
            
            updated_loan = cur.fetchone()
            if not updated_loan:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Займ не найден'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(updated_loan), ensure_ascii=False, default=json_serializer),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            path_params = event.get('pathParams') or {}
            loan_id = path_params.get('id')
            
            if not loan_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID займа обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('DELETE FROM loans WHERE id = %s RETURNING id', (loan_id,))
            deleted = cur.fetchone()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Займ не найден'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Займ удален', 'id': deleted['id']}),
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